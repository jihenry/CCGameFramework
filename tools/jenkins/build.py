# -*- coding: gbk -*-
import subprocess
import os
import sys
import getopt
import signal
import json
import traceback
import shutil
import datetime
import time
import zipfile

##########################需要每个项目修改的内容start####################################
PRODUCT = "G5_H5_HH" # 产品在发布库中目录名
##########################需要每个项目修改的内容end####################################

#发布版本
BAT_PUBLISH = r'''
cd /d {pubdir}
git pull origin master
git add {prodir}
git commit {prodir} -m "发布版本{version}"
git push origin master
git config core.sparsecheckout true
echo {product}/client > .git/info/sparse-checkout
cd /d {codedir}
'''

#检出发布库
# BAT_FIRST_CK = r'''
# mkdir {pubdir}
# cd /d {pubdir}
# git init
# git remote add -f origin https://njhh-gitlab.qianz.com/l0_lfsrepository/publish.git
# git checkout master
# cd /d {codedir}
# '''
BAT_FIRST_CK = r'''
mkdir {pubdir}
cd /d {pubdir}
git clone https://packer4jenkins:Gggggg!222222@njhh-gitlab.qianz.com/l0_lfsrepository/publish.git .
git config --user.name=packer4jenkins
git config --user.email=packer4jenkins@vk51.com
cd /d {codedir}
'''
#上传微信代码
BAT_WX_UPLOAD_CODE = r'''
cli -o {prodir}
cli -u {version}@{prodir} --upload-desc '{version}'
'''

#热更包
BAT_HOT_BUILD = r'''
node {filepath} -v {version} -u {server} -s {resdir} -d {outdir}
'''

#整包更新字符串
STR_VERSION_MANIFEST = r'''
"packageUrl":"{fileurl}","remoteManifestUrl":"{projecturl}","remoteVersionUrl":"{versionurl}","version":"{version}"
'''

#本地配置
PUBLISHDIR = r"D:\\publish"  # 发布库在本地的根目录
BUILDPATH = r"D:\\build" #工程编译目录

class Builder(object):
    def __init__(self):
        self.checkEnv()
        self.initArgv()
        self.initPath()
        self.initBuilderJson()
        self.initBuilderSetting()

    def initArgv(self):
        self.mCmdArgs = {}
        self.mMode = "normal"
        self.mChannel = "win32"
        self.mTargetDir = "" #发布目录
        self.mUpdateServer = "http://njhh-test.qianz.com/" #线上部署服务器（默认测试）
        if "UpdateServer" in os.environ and str(os.environ["UpdateServer"]) != "":
            self.mUpdateServer = os.environ["UpdateServer"]
            print("更新服务器：" + self.mUpdateServer)
        if not self.mUpdateServer.endswith("/"):
            self.mUpdateServer = self.mUpdateServer + "/"
        if len(sys.argv) > 1:
            try:
                opts, _ = getopt.getopt(sys.argv[1:], "hp:b:m:r:k:", [
                    "buildPath=", "platform=", "key=", "mode=", "raw="])
            except getopt.GetoptError:
                print('python build.py [-p|--platform <win32|android|ios|mac>] \
                    [-m|--mode <jenkins|win32>] [-r <扩展编译json串>]')
                sys.exit(2)
            print("命令行参数：%s" % opts)
            for opt, arg in opts:
                if opt == '-h':
                    print('python build.py [-p|--platform <win32|android|ios|mac>] \
                        [-m|--mode <jenkins|win32>] [-r <扩展编译json串>]')
                    sys.exit()
                elif opt in ("-p", "--platform"):
                    self.mChannel = arg
                elif opt in ("-r", "--raw"):
                    self.mCmdArgs = json.loads(arg)
                elif opt in ("-m", "--mode"):
                    self.mMode = arg
        print("打包平台为：%s" % (self.mChannel))

    def initBuilderSetting(self):
        self.mBuilderSetting = {"title": "app"}
        configArg = None
        settingFile = os.path.join(
            self.mProjectPath, "settings", "builder.json")
        if os.path.exists(settingFile):
            with open(settingFile, 'r') as f:
                configArg = json.load(f)
        if configArg is not None:
            self.mBuilderSetting = dict(self.mBuilderSetting, **configArg)
        print("初始化全局设置为：" + str(self.mBuilderSetting))

    def initBuilderJson(self):
        self.decodeVersion()
        self.mBuildArgs = {"debug": False, "template": "link", "buildPath": BUILDPATH}
        configArg = None
        if os.path.exists(self.mConfigFile):
            with open(self.mConfigFile, 'r') as f:
                configArg = json.load(f)
        if configArg is not None:
            self.mBuildArgs = dict(self.mBuildArgs, **configArg)
        # 合并命令行参数
        for (k,v) in self.mCmdArgs.items():
            if type(v) == dict:
                self.mBuildArgs[k] = dict(self.mBuildArgs[k], **v)
            else:
                self.mBuildArgs[k] = v
        if self.isPlatform("wechatgame"):
            self.mBuildArgs["wechatgame"]["REMOTE_SERVER_ROOT"] = \
                '%s%s' % (self.mBuildArgs["wechatgame"]["REMOTE_SERVER_ROOT"], self.mVersion)
        print("初始化构建参数为：" + str(self.mBuildArgs))

    def start(self):
        # 停止已经存在的cocoscreater任务，使用Popen有时候会卡住
        # self.doCmd("taskkill /IM CocosCreator.exe /F")
        try:
            os.system("taskkill /IM CocosCreator.exe /F > nul")
            self.doClean()
            self.doBuild()
            self.publish()
        except:
            if os.path.exists(self.mTargetDir):
                shutil.rmtree(self.mTargetDir,True)
            traceback.print_exc()
            sys.exit(3)

    def getBuildPath(self):
        buildPath = os.path.join(self.mProjectPath, "build") \
            if not self.mBuildArgs.has_key("buildPath") else os.path.abspath(self.mBuildArgs["buildPath"])
        if self.isNativeChannel() or self.isHotChannel():
            buildPath = os.path.join(buildPath, "jsb-%s" % self.mBuildArgs["template"])
        else:
            buildPath = os.path.join(buildPath, self.mBuildArgs["platform"])

        return buildPath

    # 解析版本号
    def decodeVersion(self):
        self.mVersion = ""
        versionFile = os.path.join(
            self.mProjectPath, "assets", "Script", "Constant.ts")
        with open(versionFile, "r") as f:
            lineData = str(f.readline())
            while (lineData):
                if "gameVersion" in lineData:
                    ls = lineData.split('"')
                    self.mVersion = ls[1]
                    break
                lineData = f.readline()
        print("版本号为：" + self.mVersion)

    # 获取执行文件路径
    def getBinFilePath(self):
        buildPath = self.getBuildPath()
        if self.mBuildArgs["debug"]:
            buildPath = os.path.join(
                buildPath, "simulator", self.mBuildArgs["platform"])
        else:
            buildPath = os.path.join(
                buildPath, "publish", self.mBuildArgs["platform"])
        debug = self.mBuildArgs["debug"]
        if self.mBuildArgs["platform"] == "win32":
            return os.path.join(buildPath, "%s.exe")
        elif self.mBuildArgs["platform"] == "android":
            return os.path.join(buildPath, "%s-%s.apk" % (self.mBuilderSetting["title"], "debug" if debug else "release-signed"))
        else:
            return ""

    def doCmd(self, cmd, finishCB=None):
        print("执行命令："+cmd)
        process = subprocess.Popen(
            cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        while True:
            line = str(process.stdout.readline()).decode("utf-8")
            print(line.encode("gbk"))
            ret = False
            if finishCB is not None:
                ret = finishCB(line)
            if ret:
                print("finishCB check ok")
                process.terminate()
                break
            status = subprocess.Popen.poll(process)
            if status is not None:  # 判断子进程是否结束
                process.terminate()
                break

    def checkEnv(self):
        # 此路径修改为此电脑的creater安装程序路径
        self.mCocosExePath = ""
        if "CREATER_ROOT" in os.environ:  # 使用环境变量有利于提前确定环境
            self.mCocosExePath = os.path.join(
                os.environ["CREATER_ROOT"], "CocosCreator.exe")
        else:
            print("请先配置CocosCreater根目录环境变量CREATER_ROOT")
            sys.exit()

    def initPath(self):
        # 此脚本放在tools/jenkins下面，相对项目根目录两层
        self.mCurrentPath = os.path.abspath(os.path.dirname(sys.argv[0]))
        self.mProjectPath = os.path.abspath(
            os.path.join(self.mCurrentPath, "..", ".."))
        self.mSvnExePath = os.path.abspath(os.path.join(
            self.mProjectPath, "tools", "svn", "bin", "svn.exe"))
        self.mConfigFile = os.path.join(
            self.mCurrentPath, self.mChannel, "config.json")

    def checkFinish(self, msg):
        if self.isNativeChannel():  # 原生平台
            return os.path.exists(self.getBinFilePath())
        else:
            return "successfull".encode("gbk") in msg

    def isNativeChannel(self):
        return self.mChannel == "android" or self.mChannel == "ios" \
            or self.mChannel == "win32" or self.mChannel == "mac"

    def isChannel(self, channel):
        return self.mChannel == channel

    def isHotChannel(self):
        return self.mChannel == "hotupdate_android" or self.mChannel == "hotupdate_ios"

    def isPlatform(self, platform):
        return self.mBuildArgs["platform"] == platform

    def doClean(self):
        self.mTargetDir = ""

    def doBuild(self):
        # 删除环境变量配置文件，此文件在后面的构建过程中使用到
        propertiesFile = os.path.join(self.mCurrentPath, "env.properties")
        if os.path.exists(propertiesFile):
            os.remove(propertiesFile)
        if self.isNativeChannel():
            binExe = self.getBinFilePath()
            if os.path.exists(binExe):
                os.remove(binExe)
        else:
            buildPath = self.getBuildPath()
            shutil.rmtree(buildPath, True)
        tmpJsonFile = os.path.join(self.mCurrentPath, "tempBuild.json")
        if os.path.exists(tmpJsonFile):
            os.remove(tmpJsonFile)
        with open(tmpJsonFile, "w") as f:
            json.dump(self.mBuildArgs, f)
        print("编译参数：" + str(self.mBuildArgs))
        # 生成默认配置
        cmd = r'%s --path "%s" --build "configPath=%s"' % (self.mCocosExePath,
                                                           self.mProjectPath, tmpJsonFile)
        self.doCmd(cmd, self.checkFinish)
        self.doChannelBuild()
        print("命令执行完成")

    # 渠道特殊的构建过程
    def doChannelBuild(self):
        if self.mChannel == "wechatgame":  # 微信渠道
            return self.doChannelWXOpenBuild()

    def doChannelWXOpenBuild(self):
        subContext = self.mBuildArgs["wechatgame"]["subContext"]
        if subContext is None or subContext == "":
            print("此工程没有配置开放域")
            return None
        configFile = os.path.join(
            self.mCurrentPath, self.mChannel, "open_config.json")
        configArg = None
        if os.path.exists(configFile):
            with open(configFile, 'r') as f:
                configArg = json.load(f)
        if configArg is None:
            print("此工程没有发现tools/jenkins/wechatgame/open_config.json配置")
            return None
        tmpJsonFile = os.path.join(self.mCurrentPath, "tempBuildOpen.json")
        configArg["buildPath"] = self.getBuildPath()
        if os.path.exists(tmpJsonFile):
            os.remove(tmpJsonFile)
        with open(tmpJsonFile, "w") as f:
            json.dump(configArg, f)
        projectPath = os.path.join(self.mProjectPath, "channels", "wechatgame")
        print("开放域编译参数：" + str(configArg))
        # 生成默认配置
        cmd = r'%s --path "%s" --build "configPath=%s"' % (self.mCocosExePath,
                                                           projectPath, tmpJsonFile)
        self.doCmd(cmd, self.checkFinish)

    def genEnvProperties(self,timeVersion):
        with open(os.path.join(self.mCurrentPath, "env.properties"), "w") as f:
            f.writelines("VERSION=%s\nPLATFORM=%s\n" %
                         (timeVersion, self.mChannel))

    def genVersionManifest(self):
        with open(os.path.join(self.mCurrentPath, "version.manifest"), "w") as f:
            content = STR_VERSION_MANIFEST.format(
                fileurl="%s%s/%s/%s.apk" % (self.mUpdateServer,self.mChannel,self.mVersion,self.mVersion),
                projecturl="%s%s/%s" % (self.mUpdateServer,self.mChannel,"project.manifest"),
                versionurl="%s%s/%s" % (self.mUpdateServer,self.mChannel,"version.manifest"),
                version=self.mVersion)
            print("version.manifest文件内容: %s" % content)
            f.write("{%s}" % content)

    def runbat(self,bat):
        print("执行bat："+bat)
        tmp_bat_file = os.path.join(self.mCurrentPath,'tmp.bat')
        with open(tmp_bat_file, 'w') as f:
            f.writelines(bat)
        os.system(tmp_bat_file)

    def addToZip(self, zf, path, zipname):
        if not os.path.exists(path):
            raise Exception(path + " 不存在！！")
        elif os.path.isfile(path):
            zf.write(path, zipname, zipfile.ZIP_DEFLATED)
        elif os.path.isdir(path):
            for nm in os.listdir(path):
                self.addToZip(zf, os.path.join(path, nm),
                            os.path.join(zipname, nm))

    def publish(self):
        if self.mMode != "jenkins":
            print("不是jenkins不发布")
            return
        if not os.path.exists(PUBLISHDIR):
            print("拉取远程git发布目录开始...")
            self.runbat(BAT_FIRST_CK.format(pubdir=PUBLISHDIR,codedir=self.mCurrentPath))
        buildDir = self.getBuildPath()
        timeTick = datetime.datetime.now().strftime("%m%d%H%M")
        timeVersion = "%s_%s" % (self.mVersion,timeTick)
        targetDir = os.path.join(PUBLISHDIR, PRODUCT.encode("gbk"), "client",
            self.mChannel,timeVersion)
        print("生成构建临时配置开始...")
        self.genEnvProperties(timeVersion)
        if self.isNativeChannel():
            self.genVersionManifest()
        print("组织发布目录开始...")
        shutil.rmtree(targetDir,True) #删除发布目录里的东西
        publishZipFile = os.path.join(targetDir,"%s.zip" % self.mVersion)
        publishDir = os.path.join(targetDir,self.mVersion)
        os.makedirs(targetDir)
        self.mTargetDir = targetDir
        if self.isPlatform("wechatgame"):
            os.makedirs(publishDir)
            res = os.path.join(buildDir,"res")
            if os.path.exists(res):
                shutil.move(os.path.join(buildDir,"res"),publishDir)
            shutil.copytree(buildDir,os.path.join(targetDir,"project"))
            # 上传代码到微信后台，也可以到git发布库中手动上传
            # self.runbat(BAT_WX_UPLOAD_CODE.format(prodir=os.path.join(buildDir,self.mBuildArgs["platform"]),version=self.mVersion))
        elif self.isNativeChannel():
            os.makedirs(publishDir)
            if self.isChannel("android"):
                apkFile = self.getBinFilePath()
                shutil.copyfile(apkFile,os.path.join(publishDir,"%s.apk" % self.mVersion))
            manifestFile = os.path.join(self.mCurrentPath, "version.manifest")
            shutil.copyfile(manifestFile,os.path.join(publishDir, "version.manifest"))
        elif self.isHotChannel(): #android/ios热更
            os.makedirs(publishDir)
            self.runbat(BAT_HOT_BUILD.format(
                server="%s%s/" % (self.mUpdateServer,self.mChannel), version=self.mVersion, 
                resdir=buildDir, outdir=publishDir, filepath=os.path.join(self.mCurrentPath,"version_generator.js")))
            shutil.copytree(os.path.join(buildDir,"res"),os.path.join(publishDir,"res"))
            shutil.copytree(os.path.join(buildDir,"src"),os.path.join(publishDir,"src"))
        else:
            shutil.copytree(buildDir,publishDir)
        #添加zip文件
        print("添加压缩文件开始...")
        zipObj = zipfile.ZipFile(publishZipFile, 'w', allowZip64=True)
        self.addToZip(zipObj,publishDir,self.mVersion if not self.isHotChannel() else "")
        zipObj.close()
        shutil.rmtree(publishDir,True)
        print("上传发布内容开始...")
        #上传文件
        self.runbat(BAT_PUBLISH.format(pubdir=PUBLISHDIR,prodir=targetDir,product=PRODUCT.encode("gbk"),
            codedir=self.mCurrentPath,version=timeVersion))
        print("发布完成！！！")
        print("发布git地址：https://njhh-gitlab.qianz.com/l0_lfsrepository/publish.git")
        print("发布目录：%s" % os.path.join(PRODUCT.encode("gbk"), "client",self.mBuildArgs["platform"].encode("gbk"),timeVersion))
        print("发布平台：%s 发布版本：%s" % (self.mBuildArgs["platform"].encode("gbk"),timeVersion))

if __name__ == "__main__":
    builder = Builder()
    builder.start()

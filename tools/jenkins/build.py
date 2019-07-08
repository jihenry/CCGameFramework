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

##########################��Ҫÿ����Ŀ�޸ĵ�����start####################################
PRODUCT = "G5_H5_HH" # ��Ʒ�ڷ�������Ŀ¼��
##########################��Ҫÿ����Ŀ�޸ĵ�����end####################################

#�����汾
BAT_PUBLISH = r'''
cd /d {pubdir}
git pull origin master
git add {prodir}
git commit {prodir} -m "�����汾{version}"
git push origin master
git config core.sparsecheckout true
echo {product}/client > .git/info/sparse-checkout
cd /d {codedir}
'''

#���������
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
#�ϴ�΢�Ŵ���
BAT_WX_UPLOAD_CODE = r'''
cli -o {prodir}
cli -u {version}@{prodir} --upload-desc '{version}'
'''

#�ȸ���
BAT_HOT_BUILD = r'''
node {filepath} -v {version} -u {server} -s {resdir} -d {outdir}
'''

#���������ַ���
STR_VERSION_MANIFEST = r'''
"packageUrl":"{fileurl}","remoteManifestUrl":"{projecturl}","remoteVersionUrl":"{versionurl}","version":"{version}"
'''

#��������
PUBLISHDIR = r"D:\\publish"  # �������ڱ��صĸ�Ŀ¼
BUILDPATH = r"D:\\build" #���̱���Ŀ¼

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
        self.mTargetDir = "" #����Ŀ¼
        self.mUpdateServer = "http://njhh-test.qianz.com/" #���ϲ����������Ĭ�ϲ��ԣ�
        if "UpdateServer" in os.environ and str(os.environ["UpdateServer"]) != "":
            self.mUpdateServer = os.environ["UpdateServer"]
            print("���·�������" + self.mUpdateServer)
        if not self.mUpdateServer.endswith("/"):
            self.mUpdateServer = self.mUpdateServer + "/"
        if len(sys.argv) > 1:
            try:
                opts, _ = getopt.getopt(sys.argv[1:], "hp:b:m:r:k:", [
                    "buildPath=", "platform=", "key=", "mode=", "raw="])
            except getopt.GetoptError:
                print('python build.py [-p|--platform <win32|android|ios|mac>] \
                    [-m|--mode <jenkins|win32>] [-r <��չ����json��>]')
                sys.exit(2)
            print("�����в�����%s" % opts)
            for opt, arg in opts:
                if opt == '-h':
                    print('python build.py [-p|--platform <win32|android|ios|mac>] \
                        [-m|--mode <jenkins|win32>] [-r <��չ����json��>]')
                    sys.exit()
                elif opt in ("-p", "--platform"):
                    self.mChannel = arg
                elif opt in ("-r", "--raw"):
                    self.mCmdArgs = json.loads(arg)
                elif opt in ("-m", "--mode"):
                    self.mMode = arg
        print("���ƽ̨Ϊ��%s" % (self.mChannel))

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
        print("��ʼ��ȫ������Ϊ��" + str(self.mBuilderSetting))

    def initBuilderJson(self):
        self.decodeVersion()
        self.mBuildArgs = {"debug": False, "template": "link", "buildPath": BUILDPATH}
        configArg = None
        if os.path.exists(self.mConfigFile):
            with open(self.mConfigFile, 'r') as f:
                configArg = json.load(f)
        if configArg is not None:
            self.mBuildArgs = dict(self.mBuildArgs, **configArg)
        # �ϲ������в���
        for (k,v) in self.mCmdArgs.items():
            if type(v) == dict:
                self.mBuildArgs[k] = dict(self.mBuildArgs[k], **v)
            else:
                self.mBuildArgs[k] = v
        if self.isPlatform("wechatgame"):
            self.mBuildArgs["wechatgame"]["REMOTE_SERVER_ROOT"] = \
                '%s%s' % (self.mBuildArgs["wechatgame"]["REMOTE_SERVER_ROOT"], self.mVersion)
        print("��ʼ����������Ϊ��" + str(self.mBuildArgs))

    def start(self):
        # ֹͣ�Ѿ����ڵ�cocoscreater����ʹ��Popen��ʱ��Ῠס
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

    # �����汾��
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
        print("�汾��Ϊ��" + self.mVersion)

    # ��ȡִ���ļ�·��
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
        print("ִ�����"+cmd)
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
            if status is not None:  # �ж��ӽ����Ƿ����
                process.terminate()
                break

    def checkEnv(self):
        # ��·���޸�Ϊ�˵��Ե�creater��װ����·��
        self.mCocosExePath = ""
        if "CREATER_ROOT" in os.environ:  # ʹ�û���������������ǰȷ������
            self.mCocosExePath = os.path.join(
                os.environ["CREATER_ROOT"], "CocosCreator.exe")
        else:
            print("��������CocosCreater��Ŀ¼��������CREATER_ROOT")
            sys.exit()

    def initPath(self):
        # �˽ű�����tools/jenkins���棬�����Ŀ��Ŀ¼����
        self.mCurrentPath = os.path.abspath(os.path.dirname(sys.argv[0]))
        self.mProjectPath = os.path.abspath(
            os.path.join(self.mCurrentPath, "..", ".."))
        self.mSvnExePath = os.path.abspath(os.path.join(
            self.mProjectPath, "tools", "svn", "bin", "svn.exe"))
        self.mConfigFile = os.path.join(
            self.mCurrentPath, self.mChannel, "config.json")

    def checkFinish(self, msg):
        if self.isNativeChannel():  # ԭ��ƽ̨
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
        # ɾ���������������ļ������ļ��ں���Ĺ���������ʹ�õ�
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
        print("���������" + str(self.mBuildArgs))
        # ����Ĭ������
        cmd = r'%s --path "%s" --build "configPath=%s"' % (self.mCocosExePath,
                                                           self.mProjectPath, tmpJsonFile)
        self.doCmd(cmd, self.checkFinish)
        self.doChannelBuild()
        print("����ִ�����")

    # ��������Ĺ�������
    def doChannelBuild(self):
        if self.mChannel == "wechatgame":  # ΢������
            return self.doChannelWXOpenBuild()

    def doChannelWXOpenBuild(self):
        subContext = self.mBuildArgs["wechatgame"]["subContext"]
        if subContext is None or subContext == "":
            print("�˹���û�����ÿ�����")
            return None
        configFile = os.path.join(
            self.mCurrentPath, self.mChannel, "open_config.json")
        configArg = None
        if os.path.exists(configFile):
            with open(configFile, 'r') as f:
                configArg = json.load(f)
        if configArg is None:
            print("�˹���û�з���tools/jenkins/wechatgame/open_config.json����")
            return None
        tmpJsonFile = os.path.join(self.mCurrentPath, "tempBuildOpen.json")
        configArg["buildPath"] = self.getBuildPath()
        if os.path.exists(tmpJsonFile):
            os.remove(tmpJsonFile)
        with open(tmpJsonFile, "w") as f:
            json.dump(configArg, f)
        projectPath = os.path.join(self.mProjectPath, "channels", "wechatgame")
        print("��������������" + str(configArg))
        # ����Ĭ������
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
            print("version.manifest�ļ�����: %s" % content)
            f.write("{%s}" % content)

    def runbat(self,bat):
        print("ִ��bat��"+bat)
        tmp_bat_file = os.path.join(self.mCurrentPath,'tmp.bat')
        with open(tmp_bat_file, 'w') as f:
            f.writelines(bat)
        os.system(tmp_bat_file)

    def addToZip(self, zf, path, zipname):
        if not os.path.exists(path):
            raise Exception(path + " �����ڣ���")
        elif os.path.isfile(path):
            zf.write(path, zipname, zipfile.ZIP_DEFLATED)
        elif os.path.isdir(path):
            for nm in os.listdir(path):
                self.addToZip(zf, os.path.join(path, nm),
                            os.path.join(zipname, nm))

    def publish(self):
        if self.mMode != "jenkins":
            print("����jenkins������")
            return
        if not os.path.exists(PUBLISHDIR):
            print("��ȡԶ��git����Ŀ¼��ʼ...")
            self.runbat(BAT_FIRST_CK.format(pubdir=PUBLISHDIR,codedir=self.mCurrentPath))
        buildDir = self.getBuildPath()
        timeTick = datetime.datetime.now().strftime("%m%d%H%M")
        timeVersion = "%s_%s" % (self.mVersion,timeTick)
        targetDir = os.path.join(PUBLISHDIR, PRODUCT.encode("gbk"), "client",
            self.mChannel,timeVersion)
        print("���ɹ�����ʱ���ÿ�ʼ...")
        self.genEnvProperties(timeVersion)
        if self.isNativeChannel():
            self.genVersionManifest()
        print("��֯����Ŀ¼��ʼ...")
        shutil.rmtree(targetDir,True) #ɾ������Ŀ¼��Ķ���
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
            # �ϴ����뵽΢�ź�̨��Ҳ���Ե�git���������ֶ��ϴ�
            # self.runbat(BAT_WX_UPLOAD_CODE.format(prodir=os.path.join(buildDir,self.mBuildArgs["platform"]),version=self.mVersion))
        elif self.isNativeChannel():
            os.makedirs(publishDir)
            if self.isChannel("android"):
                apkFile = self.getBinFilePath()
                shutil.copyfile(apkFile,os.path.join(publishDir,"%s.apk" % self.mVersion))
            manifestFile = os.path.join(self.mCurrentPath, "version.manifest")
            shutil.copyfile(manifestFile,os.path.join(publishDir, "version.manifest"))
        elif self.isHotChannel(): #android/ios�ȸ�
            os.makedirs(publishDir)
            self.runbat(BAT_HOT_BUILD.format(
                server="%s%s/" % (self.mUpdateServer,self.mChannel), version=self.mVersion, 
                resdir=buildDir, outdir=publishDir, filepath=os.path.join(self.mCurrentPath,"version_generator.js")))
            shutil.copytree(os.path.join(buildDir,"res"),os.path.join(publishDir,"res"))
            shutil.copytree(os.path.join(buildDir,"src"),os.path.join(publishDir,"src"))
        else:
            shutil.copytree(buildDir,publishDir)
        #���zip�ļ�
        print("���ѹ���ļ���ʼ...")
        zipObj = zipfile.ZipFile(publishZipFile, 'w', allowZip64=True)
        self.addToZip(zipObj,publishDir,self.mVersion if not self.isHotChannel() else "")
        zipObj.close()
        shutil.rmtree(publishDir,True)
        print("�ϴ��������ݿ�ʼ...")
        #�ϴ��ļ�
        self.runbat(BAT_PUBLISH.format(pubdir=PUBLISHDIR,prodir=targetDir,product=PRODUCT.encode("gbk"),
            codedir=self.mCurrentPath,version=timeVersion))
        print("������ɣ�����")
        print("����git��ַ��https://njhh-gitlab.qianz.com/l0_lfsrepository/publish.git")
        print("����Ŀ¼��%s" % os.path.join(PRODUCT.encode("gbk"), "client",self.mBuildArgs["platform"].encode("gbk"),timeVersion))
        print("����ƽ̨��%s �����汾��%s" % (self.mBuildArgs["platform"].encode("gbk"),timeVersion))

if __name__ == "__main__":
    builder = Builder()
    builder.start()

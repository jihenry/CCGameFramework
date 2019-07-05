#pragma once
#include <string>
class txbugly
{
public:
	/**
	*    @brief 初始化
	*
	*    @param appId 注册应用时，Bugly分配的AppID
	*/
	static void initCrashReport(const std::string& appId);

	/**
	*    @brief 初始化
	*
	*    @param appId 注册应用时，Bugly分配的AppID
	*    @param debug 是否开启Debug信息打印，默认关闭，开启则会打印SDK的调试信息
	*/
	static void initCrashReport(const std::string& appId, bool debug);

	/**
	*    @brief 设置应用的用户唯一标识
	*
	*    @param userId
	*/
	static void setUserId(const std::string& userId);

	/**
	*    @brief 上报自定义错误
	*
	*    @param category  错误的分类，5表示Lua错误，6表示JS错误
	*    @param type      错误类型的名称
	*    @param msg       错误原因
	*    @param traceback 错误堆栈
	*/
	static void reportException(int category, const std::string& type, const std::string& msg, const std::string& traceback);

	static void reportException(int category, const std::string& type, const std::string& msg, const std::string& traceback, bool quit);

	/**
	*    @brief 设置自定义标签，标签需预先在Bugly平台定义
	*
	*    @param tag
	*/
	static void setTag(int tag);

	/**
	*    @brief 设置自定义Key-Value
	*
	*    @param key
	*    @param value
	*/
	static void addUserValue(const std::string& key, const std::string& value);

	/**
	*    @brief 删除指定的Key-Value
	*
	*    @param key
	*/
	static void removeUserValue(const std::string& key);

	/**
	* 日志级别
	*/
	//enum CRLogLevel { Off = 0, Error = 1, Warning = 2, Info = 3, Debug = 4, Verbose = 5 };

	/**
	*    @brief 自定义日志
	*
	*    @param level 日志级别 {@link CRLogLevel}
	*    @param tag   日志标签
	*    @param fmt   日志内容
	*    @param ...   动态参数
	*/
	static void log(int level, const std::string& tag, const std::string& fmt);

	/**
	*    @brief 初始化
	*
	*    @param appId 注册应用时，Bugly分配的AppID
	*    @param debug 是否开启Debug信息打印，默认关闭，开启则会打印SDK的调试信息
	*    @param level 是否开启崩溃时自定义日志的上报，默认值为 {@link CRLogLevel:Off}，即关闭。设置为其他的值，即会在崩溃时上报自定义日志。如设置为CRLogLevel:Warning，则会上报CRLogLevel:Warning、CRLogLevel:Error的日志
	*/
	static void initCrashReport(const std::string& appId, bool debug, int level);

	/**
	*    @brief 设置渠道
	*
	*    @param channel 渠道标识
	*/
	static void setAppChannel(const std::string& channel);

	/**
	*    @brief 设置应用版本
	*
	*    @param version 应用版本信息
	*/
	static void setAppVersion(const std::string& version);

	/**
	*    @brief 设置CrashReporter的渠道类别，默认值为0，表示官方版本，2表示MSDK内置版本，3表示IM SDK内置版本
	*
	*    @param type
	*/
	static void setCrashReporterType(int type);

	static void setHotVersion(const std::string& _v);

	static std::string getHotVersion();
private:
	static std::string _version;
};


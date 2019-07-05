#include "txbugly.h"

#include "bugly/CrashReport.h"

std::string txbugly::_version = "";
void txbugly::initCrashReport(const std::string& appId) {
	CrashReport::initCrashReport(appId.c_str());
}

void txbugly::initCrashReport(const std::string& appId, bool debug) {
	CrashReport::initCrashReport(appId.c_str(), debug);
}

void txbugly::initCrashReport(const std::string& appId, bool debug, int level) {
	CrashReport::initCrashReport(appId.c_str(), debug,CrashReport::CRLogLevel(level));
}

void txbugly::setUserId(const std::string& userId) {
	CrashReport::setUserId(userId.c_str());
}

void txbugly::reportException(int category, const std::string& type, const std::string& msg, const std::string& traceback, bool quit) {
	CrashReport::reportException(category, type.c_str(), msg.c_str(), traceback.c_str(), quit);
}

void txbugly::reportException(int category, const std::string& type, const std::string& msg, const std::string& traceback) {
	CrashReport::reportException(category,type.c_str(),msg.c_str(),traceback.c_str());
}

void txbugly::setTag(int tag) {
	CrashReport::setTag(tag);
}

void txbugly::addUserValue(const std::string& key, const std::string& value) {
	CrashReport::addUserValue(key.c_str(), value.c_str());
}

void txbugly::removeUserValue(const std::string& key) {
	CrashReport::removeUserValue(key.c_str());
}

void txbugly::log(int level, const std::string& tag, const std::string& fmt) {
	CrashReport::log(CrashReport::CRLogLevel(level), tag.c_str(), fmt.c_str());
}

void txbugly::setAppChannel(const std::string& channel) {
	CrashReport::setAppChannel(channel.c_str());
}

void txbugly::setAppVersion(const std::string& version) {
	CrashReport::setAppVersion(version.c_str());
}

void txbugly::setCrashReporterType(int type) {
	CrashReport::setCrashReporterType(type);
}

void txbugly::setHotVersion(const std::string& _v) {
	_version = _v;
}
std::string txbugly::getHotVersion() {
	return _version;
}

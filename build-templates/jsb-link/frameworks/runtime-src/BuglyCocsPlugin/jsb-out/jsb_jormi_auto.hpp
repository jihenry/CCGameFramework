#pragma once
#include "base/ccConfig.h"

#include "cocos/scripting/js-bindings/jswrapper/SeApi.h"

extern se::Object* __jsb_txbugly_proto;
extern se::Class* __jsb_txbugly_class;

bool js_register_txbugly(se::Object* obj);
bool register_all_jormi(se::Object* obj);
SE_DECLARE_FUNC(js_jormi_txbugly_setHotVersion);
SE_DECLARE_FUNC(js_jormi_txbugly_setUserId);
SE_DECLARE_FUNC(js_jormi_txbugly_log);
SE_DECLARE_FUNC(js_jormi_txbugly_initCrashReport);
SE_DECLARE_FUNC(js_jormi_txbugly_addUserValue);
SE_DECLARE_FUNC(js_jormi_txbugly_setAppVersion);
SE_DECLARE_FUNC(js_jormi_txbugly_reportException);
SE_DECLARE_FUNC(js_jormi_txbugly_setCrashReporterType);
SE_DECLARE_FUNC(js_jormi_txbugly_setTag);
SE_DECLARE_FUNC(js_jormi_txbugly_removeUserValue);
SE_DECLARE_FUNC(js_jormi_txbugly_setAppChannel);
SE_DECLARE_FUNC(js_jormi_txbugly_testNativeCrash);
SE_DECLARE_FUNC(js_jormi_txbugly_getHotVersion);


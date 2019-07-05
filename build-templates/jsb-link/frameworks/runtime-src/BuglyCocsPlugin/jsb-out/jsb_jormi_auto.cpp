#include "jsb_jormi_auto.hpp"
#include "scripting/js-bindings/manual/jsb_conversions.hpp"
#include "scripting/js-bindings/manual/jsb_global.h"
#include "txbugly.h"

se::Object* __jsb_txbugly_proto = nullptr;
se::Class* __jsb_txbugly_class = nullptr;

static bool js_jormi_txbugly_setHotVersion(se::State& s)
{
    const auto& args = s.args();
    size_t argc = args.size();
    CC_UNUSED bool ok = true;
    if (argc == 1) {
        std::string arg0;
        ok &= seval_to_std_string(args[0], &arg0);
        SE_PRECONDITION2(ok, false, "js_jormi_txbugly_setHotVersion : Error processing arguments");
        txbugly::setHotVersion(arg0);
        return true;
    }
    SE_REPORT_ERROR("wrong number of arguments: %d, was expecting %d", (int)argc, 1);
    return false;
}
SE_BIND_FUNC(js_jormi_txbugly_setHotVersion)

static bool js_jormi_txbugly_setUserId(se::State& s)
{
    const auto& args = s.args();
    size_t argc = args.size();
    CC_UNUSED bool ok = true;
    if (argc == 1) {
        std::string arg0;
        ok &= seval_to_std_string(args[0], &arg0);
        SE_PRECONDITION2(ok, false, "js_jormi_txbugly_setUserId : Error processing arguments");
        txbugly::setUserId(arg0);
        return true;
    }
    SE_REPORT_ERROR("wrong number of arguments: %d, was expecting %d", (int)argc, 1);
    return false;
}
SE_BIND_FUNC(js_jormi_txbugly_setUserId)

static bool js_jormi_txbugly_log(se::State& s)
{
    const auto& args = s.args();
    size_t argc = args.size();
    CC_UNUSED bool ok = true;
    if (argc == 3) {
        int arg0 = 0;
        std::string arg1;
        std::string arg2;
        ok &= seval_to_int32(args[0], (int32_t*)&arg0);
        ok &= seval_to_std_string(args[1], &arg1);
        ok &= seval_to_std_string(args[2], &arg2);
        SE_PRECONDITION2(ok, false, "js_jormi_txbugly_log : Error processing arguments");
        txbugly::log(arg0, arg1, arg2);
        return true;
    }
    SE_REPORT_ERROR("wrong number of arguments: %d, was expecting %d", (int)argc, 3);
    return false;
}
SE_BIND_FUNC(js_jormi_txbugly_log)

static bool js_jormi_txbugly_initCrashReport(se::State& s)
{
    CC_UNUSED bool ok = true;
    const auto& args = s.args();
    size_t argc = args.size();
    do {
        if (argc == 2) {
            std::string arg0;
            ok &= seval_to_std_string(args[0], &arg0);
            if (!ok) { ok = true; break; }
            bool arg1;
            ok &= seval_to_boolean(args[1], &arg1);
            if (!ok) { ok = true; break; }
            txbugly::initCrashReport(arg0, arg1);
            return true;
        }
    } while (false);
    do {
        if (argc == 1) {
            std::string arg0;
            ok &= seval_to_std_string(args[0], &arg0);
            if (!ok) { ok = true; break; }
            txbugly::initCrashReport(arg0);
            return true;
        }
    } while (false);
    do {
        if (argc == 3) {
            std::string arg0;
            ok &= seval_to_std_string(args[0], &arg0);
            if (!ok) { ok = true; break; }
            bool arg1;
            ok &= seval_to_boolean(args[1], &arg1);
            if (!ok) { ok = true; break; }
            int arg2 = 0;
            ok &= seval_to_int32(args[2], (int32_t*)&arg2);
            if (!ok) { ok = true; break; }
            txbugly::initCrashReport(arg0, arg1, arg2);
            return true;
        }
    } while (false);
    SE_REPORT_ERROR("wrong number of arguments: %d", (int)argc);
    return false;
}
SE_BIND_FUNC(js_jormi_txbugly_initCrashReport)

static bool js_jormi_txbugly_addUserValue(se::State& s)
{
    const auto& args = s.args();
    size_t argc = args.size();
    CC_UNUSED bool ok = true;
    if (argc == 2) {
        std::string arg0;
        std::string arg1;
        ok &= seval_to_std_string(args[0], &arg0);
        ok &= seval_to_std_string(args[1], &arg1);
        SE_PRECONDITION2(ok, false, "js_jormi_txbugly_addUserValue : Error processing arguments");
        txbugly::addUserValue(arg0, arg1);
        return true;
    }
    SE_REPORT_ERROR("wrong number of arguments: %d, was expecting %d", (int)argc, 2);
    return false;
}
SE_BIND_FUNC(js_jormi_txbugly_addUserValue)

static bool js_jormi_txbugly_setAppVersion(se::State& s)
{
    const auto& args = s.args();
    size_t argc = args.size();
    CC_UNUSED bool ok = true;
    if (argc == 1) {
        std::string arg0;
        ok &= seval_to_std_string(args[0], &arg0);
        SE_PRECONDITION2(ok, false, "js_jormi_txbugly_setAppVersion : Error processing arguments");
        txbugly::setAppVersion(arg0);
        return true;
    }
    SE_REPORT_ERROR("wrong number of arguments: %d, was expecting %d", (int)argc, 1);
    return false;
}
SE_BIND_FUNC(js_jormi_txbugly_setAppVersion)

static bool js_jormi_txbugly_reportException(se::State& s)
{
    CC_UNUSED bool ok = true;
    const auto& args = s.args();
    size_t argc = args.size();
    do {
        if (argc == 5) {
            int arg0 = 0;
            ok &= seval_to_int32(args[0], (int32_t*)&arg0);
            if (!ok) { ok = true; break; }
            std::string arg1;
            ok &= seval_to_std_string(args[1], &arg1);
            if (!ok) { ok = true; break; }
            std::string arg2;
            ok &= seval_to_std_string(args[2], &arg2);
            if (!ok) { ok = true; break; }
            std::string arg3;
            ok &= seval_to_std_string(args[3], &arg3);
            if (!ok) { ok = true; break; }
            bool arg4;
            ok &= seval_to_boolean(args[4], &arg4);
            if (!ok) { ok = true; break; }
            txbugly::reportException(arg0, arg1, arg2, arg3, arg4);
            return true;
        }
    } while (false);
    do {
        if (argc == 4) {
            int arg0 = 0;
            ok &= seval_to_int32(args[0], (int32_t*)&arg0);
            if (!ok) { ok = true; break; }
            std::string arg1;
            ok &= seval_to_std_string(args[1], &arg1);
            if (!ok) { ok = true; break; }
            std::string arg2;
            ok &= seval_to_std_string(args[2], &arg2);
            if (!ok) { ok = true; break; }
            std::string arg3;
            ok &= seval_to_std_string(args[3], &arg3);
            if (!ok) { ok = true; break; }
            txbugly::reportException(arg0, arg1, arg2, arg3);
            return true;
        }
    } while (false);
    SE_REPORT_ERROR("wrong number of arguments: %d", (int)argc);
    return false;
}
SE_BIND_FUNC(js_jormi_txbugly_reportException)

static bool js_jormi_txbugly_setCrashReporterType(se::State& s)
{
    const auto& args = s.args();
    size_t argc = args.size();
    CC_UNUSED bool ok = true;
    if (argc == 1) {
        int arg0 = 0;
        ok &= seval_to_int32(args[0], (int32_t*)&arg0);
        SE_PRECONDITION2(ok, false, "js_jormi_txbugly_setCrashReporterType : Error processing arguments");
        txbugly::setCrashReporterType(arg0);
        return true;
    }
    SE_REPORT_ERROR("wrong number of arguments: %d, was expecting %d", (int)argc, 1);
    return false;
}
SE_BIND_FUNC(js_jormi_txbugly_setCrashReporterType)

static bool js_jormi_txbugly_setTag(se::State& s)
{
    const auto& args = s.args();
    size_t argc = args.size();
    CC_UNUSED bool ok = true;
    if (argc == 1) {
        int arg0 = 0;
        ok &= seval_to_int32(args[0], (int32_t*)&arg0);
        SE_PRECONDITION2(ok, false, "js_jormi_txbugly_setTag : Error processing arguments");
        txbugly::setTag(arg0);
        return true;
    }
    SE_REPORT_ERROR("wrong number of arguments: %d, was expecting %d", (int)argc, 1);
    return false;
}
SE_BIND_FUNC(js_jormi_txbugly_setTag)

static bool js_jormi_txbugly_removeUserValue(se::State& s)
{
    const auto& args = s.args();
    size_t argc = args.size();
    CC_UNUSED bool ok = true;
    if (argc == 1) {
        std::string arg0;
        ok &= seval_to_std_string(args[0], &arg0);
        SE_PRECONDITION2(ok, false, "js_jormi_txbugly_removeUserValue : Error processing arguments");
        txbugly::removeUserValue(arg0);
        return true;
    }
    SE_REPORT_ERROR("wrong number of arguments: %d, was expecting %d", (int)argc, 1);
    return false;
}
SE_BIND_FUNC(js_jormi_txbugly_removeUserValue)

static bool js_jormi_txbugly_setAppChannel(se::State& s)
{
    const auto& args = s.args();
    size_t argc = args.size();
    CC_UNUSED bool ok = true;
    if (argc == 1) {
        std::string arg0;
        ok &= seval_to_std_string(args[0], &arg0);
        SE_PRECONDITION2(ok, false, "js_jormi_txbugly_setAppChannel : Error processing arguments");
        txbugly::setAppChannel(arg0);
        return true;
    }
    SE_REPORT_ERROR("wrong number of arguments: %d, was expecting %d", (int)argc, 1);
    return false;
}
SE_BIND_FUNC(js_jormi_txbugly_setAppChannel)

static bool js_jormi_txbugly_testNativeCrash(se::State& s)
{
    SE_REPORT_ERROR("testNativeCrash start");
    char* b = nullptr;
    b[1] = 'd';
    log(b[1]);

    return true;
}
SE_BIND_FUNC(js_jormi_txbugly_testNativeCrash)

static bool js_jormi_txbugly_getHotVersion(se::State& s)
{
    const auto& args = s.args();
    size_t argc = args.size();
    CC_UNUSED bool ok = true;
    if (argc == 0) {
        std::string result = txbugly::getHotVersion();
        ok &= std_string_to_seval(result, &s.rval());
        SE_PRECONDITION2(ok, false, "js_jormi_txbugly_getHotVersion : Error processing arguments");
        return true;
    }
    SE_REPORT_ERROR("wrong number of arguments: %d, was expecting %d", (int)argc, 0);
    return false;
}
SE_BIND_FUNC(js_jormi_txbugly_getHotVersion)



static bool js_txbugly_finalize(se::State& s)
{
    CCLOGINFO("jsbindings: finalizing JS object %p (txbugly)", s.nativeThisObject());
    auto iter = se::NonRefNativePtrCreatedByCtorMap::find(s.nativeThisObject());
    if (iter != se::NonRefNativePtrCreatedByCtorMap::end())
    {
        se::NonRefNativePtrCreatedByCtorMap::erase(iter);
        txbugly* cobj = (txbugly*)s.nativeThisObject();
        delete cobj;
    }
    return true;
}
SE_BIND_FINALIZE_FUNC(js_txbugly_finalize)

bool js_register_jormi_txbugly(se::Object* obj)
{
    auto cls = se::Class::create("txbugly", obj, nullptr, nullptr);

    cls->defineStaticFunction("setHotVersion", _SE(js_jormi_txbugly_setHotVersion));
    cls->defineStaticFunction("setUserId", _SE(js_jormi_txbugly_setUserId));
    cls->defineStaticFunction("log", _SE(js_jormi_txbugly_log));
    cls->defineStaticFunction("initCrashReport", _SE(js_jormi_txbugly_initCrashReport));
    cls->defineStaticFunction("addUserValue", _SE(js_jormi_txbugly_addUserValue));
    cls->defineStaticFunction("setAppVersion", _SE(js_jormi_txbugly_setAppVersion));
    cls->defineStaticFunction("reportException", _SE(js_jormi_txbugly_reportException));
    cls->defineStaticFunction("setCrashReporterType", _SE(js_jormi_txbugly_setCrashReporterType));
    cls->defineStaticFunction("setTag", _SE(js_jormi_txbugly_setTag));
    cls->defineStaticFunction("removeUserValue", _SE(js_jormi_txbugly_removeUserValue));
    cls->defineStaticFunction("setAppChannel", _SE(js_jormi_txbugly_setAppChannel));
    cls->defineStaticFunction("getHotVersion", _SE(js_jormi_txbugly_getHotVersion));
    cls->defineStaticFunction("testNativeCrash", _SE(js_jormi_txbugly_testNativeCrash));
    cls->defineFinalizeFunction(_SE(js_txbugly_finalize));
    cls->install();
    JSBClassType::registerClass<txbugly>(cls);

    __jsb_txbugly_proto = cls->getProto();
    __jsb_txbugly_class = cls;

    se::ScriptEngine::getInstance()->clearException();
    return true;
}

bool register_all_jormi(se::Object* obj)
{
    // Get the ns
    se::Value nsVal;
    if (!obj->getProperty("jm", &nsVal))
    {
        se::HandleObject jsobj(se::Object::createPlainObject());
        nsVal.setObject(jsobj);
        obj->setProperty("jm", nsVal);
    }
    se::Object* ns = nsVal.toObject();

    js_register_jormi_txbugly(ns);
    return true;
}


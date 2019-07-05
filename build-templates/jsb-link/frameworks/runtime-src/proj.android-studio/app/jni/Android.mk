LOCAL_PATH := $(call my-dir)

# --- 引用 libBugly.so ---
include $(CLEAR_VARS)

LOCAL_MODULE := bugly_native_prebuilt
# 可在Application.mk添加APP_ABI := armeabi armeabi-v7a 指定集成对应架构的.so文件
LOCAL_SRC_FILES := prebuilt/$(TARGET_ARCH_ABI)/libBugly.so

include $(PREBUILT_SHARED_LIBRARY)
# --- end ---

include $(CLEAR_VARS)

LOCAL_MODULE := cocos2djs_shared

LOCAL_MODULE_FILENAME := libcocos2djs

ifeq ($(USE_ARM_MODE),1)
LOCAL_ARM_MODE := arm
endif

LOCAL_SRC_FILES := hellojavascript/main.cpp \
				   ../../../Classes/AppDelegate.cpp \
				   ../../../Classes/jsb_module_register.cpp \
				   ../../../BuglyCocsPlugin/bugly/CrashReport.cpp \
				   ../../../BuglyCocsPlugin/jsb/txbugly.cpp \
				   ../../../BuglyCocsPlugin/jsb-out/jsb_jormi_auto.cpp \

LOCAL_C_INCLUDES := $(LOCAL_PATH)/../../../Classes \
                    $(LOCAL_PATH)/../../../BuglyCocsPlugin \
                    $(LOCAL_PATH)/../../../BuglyCocsPlugin/bugly \
                    $(LOCAL_PATH)/../../../BuglyCocsPlugin/jsb \
                    $(LOCAL_PATH)/../../../BuglyCocsPlugin/jsb-out \

LOCAL_STATIC_LIBRARIES := cocos2dx_static
LOCAL_SHARED_LIBRARIES := bugly_native_prebuilt

include $(BUILD_SHARED_LIBRARY)

$(call import-module, cocos)
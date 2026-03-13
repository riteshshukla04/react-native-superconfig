#include "NitroSuperconfigOnLoad.hpp"
#include <fbjni/fbjni.h>
#include <jni.h>

void register_superconfig_native();

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void*) {
  return facebook::jni::initialize(vm, []() {
    margelo::nitro::superconfig::registerAllNatives();
    register_superconfig_native();
  });
}
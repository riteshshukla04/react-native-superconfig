#include "NitroSuperconfigOnLoad.hpp"
#include <fbjni/fbjni.h>
#include <jni.h>

void register_superconfig_native();

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM *vm, void *) {
  margelo::nitro::superconfig::initialize(vm);
  return facebook::jni::initialize(vm, [] { register_superconfig_native(); });
}

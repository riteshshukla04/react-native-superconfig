#include <jni.h>
#include "NitroSuperconfigOnLoad.hpp"

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void*) {
  return margelo::nitro::superconfig::initialize(vm);
}

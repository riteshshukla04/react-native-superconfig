#include "configGetter.hpp"
#include <fbjni/fbjni.h>
#include <jni.h>

using namespace facebook::jni;

static local_ref<jobject> getConfigNative(alias_ref<jclass>) {
  std::unordered_map<std::string, std::string> configMap = getActualConfig();

  // java.util.HashMap
  auto hashMapClass = findClassStatic("java/util/HashMap");
  auto ctor = hashMapClass->getConstructor<jobject()>();
  auto putMethod = hashMapClass->getMethod<alias_ref<JObject>(
      alias_ref<JObject>, alias_ref<JObject>)>("put");

  auto hashMapObj = hashMapClass->newObject(ctor);

  for (const auto &[key, value] : configMap) {
    auto jKey = make_jstring(key);
    auto jValue = make_jstring(value);
    putMethod(hashMapObj, jKey, jValue);
  }

  return hashMapObj;
}

void register_superconfig_native() {
  registerNatives(
      "com/margelo/nitro/superconfig/NativeSuperConfig",
      {
          makeNativeMethod("getConfigNative", "()Ljava/util/HashMap;",
                           getConfigNative),
      });
}
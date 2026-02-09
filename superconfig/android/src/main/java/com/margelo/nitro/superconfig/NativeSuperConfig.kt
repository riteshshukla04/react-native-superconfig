@file:JvmName("NativeSuperConfig")
package com.margelo.nitro.superconfig

import java.util.HashMap
import com.facebook.proguard.annotations.DoNotStrip

@DoNotStrip
object NativeSuperConfig {
  @DoNotStrip
  private external fun getConfigNative(): HashMap<String, String>

  val config: HashMap<String,String> by lazy {
    System.loadLibrary("NitroSuperconfig");
    getConfigNative();
  }
}
@file:JvmName("NativeSuperConfig")
package com.margelo.nitro.superconfig

import java.util.HashMap

private external fun getConfigNative(): HashMap<String, String>

val config: HashMap<String,String> by lazy {
    System.loadLibrary("NitroSuperconfig");
    getConfigNative();
}
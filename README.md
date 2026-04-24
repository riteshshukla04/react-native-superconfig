# react-native-superconfig ⚡

A blazing-fast configuration library (>18x faster) for React Native, powered by [Nitro Modules](https://github.com/mrousavy/nitro). Access your environment variables with native performance through C++ bindings.

## Why superconfig?

- ⚡ Superfast. More than 18x faster 
- 🔥 Built on Nitro Modules for native performance
- 🎯 Simple API - works just like react-native-config
- 🔄 Automatic config generation from `.env` files
- 📦 Zero runtime overhead - configs are compiled into native code
- 🛡️ Type-safe - auto-generated types from your `.env` with full autocomplete

## Installation

```bash
npm install react-native-nitro-modules react-native-superconfig
# or
yarn add react-native-nitro-modules react-native-superconfig
```

### iOS Setup

```bash
cd ios && pod install
```

The `.env` file will be automatically processed during `pod install`.

### Android Setup

No additional setup required! The `.env` file is automatically processed during the build.

## Usage

### 1. Create a `.env` file in your project root

```env
API_URL=https://api.example.com
API_KEY=your-secret-key
FEATURE_FLAG=true
```

### 2. Import and use in your React Native code

```typescript
import Config from 'react-native-superconfig';

console.log(Config.API_URL);        // "https://api.example.com"
console.log(Config.API_KEY);        // "your-secret-key"
console.log(Config.FEATURE_FLAG);   // "true"
```

That's it! Your config values are now accessible with native performance.

### Skipping keys (`# skip-superconfig`)

If you keep values in `.env` that other tools need but superconfig should **not** bake into its generated artifacts, put `# skip-superconfig` on the line above the key:

```env
# skip-superconfig
APP_NAME=My App
```

The next key assignment after the marker is excluded from every generated file: `configGetter.hpp`, `superconfig.d.ts`, and (when `injectBuildVars` is on) `superconfig-env.xcconfig` and `android/superconfig-env.properties`. Blank lines and regular `#` comments between the marker and the key are fine — only the next key=value line consumes the marker.

## Types

> **Note**: A `superconfig.d.ts` file is auto-generated in your project root from your `.env` file, giving you full autocomplete and type checking out of the box.

### Type Safety Tips (Optional):
Since `react-native-superconfig` generates types based on your local `.env`, the initial install might not have your specific keys. We include a `postinstall` script to generate them automatically, but package managers can sometimes be flaky with these hooks.
To ensure **100% type safety** locally and in CI, add this to your app's `package.json`:

```json
"scripts": {
  "generate-config": "node ./node_modules/react-native-superconfig/scripts/generate-config.js",
  "postinstall": "bun run generate-config && patch-package"
}
```
Example:- https://github.com/Jellify-Music/App/blob/da4058120d1a985d6ab9bd914772a6d548ba54f4/package.json#L37-L38

## How it works

superconfig uses a build-time script that:

1. Reads your `.env` file
2. Generates a C++ header file (`configGetter.hpp`) with your config values
3. Exposes them through Nitro Modules for instant access

This means **zero JavaScript bridge overhead** - your configs are accessed directly from native code!

We tested in Jellify app and found that it increased tti to 3%

## API

The API is identical to react-native-config:

```typescript
import Config from 'react-native-superconfig';

// Access any environment variable
const value = Config.YOUR_ENV_VAR;
```

## Native Usage

You can also access your configuration values directly from native code (iOS & Android).

### iOS (Swift)

1. Add `NativeSuperConfig` to your target in `Podfile` (if not already there):
```ruby
pod 'NativeSuperConfig', :path => '../node_modules/superconfig/NitroSuperconfigNative.podspec'
```

2. Import and use:
```swift
import NativeSuperConfig

// Access config values
let config = ConfigGetter.getNativeConfig()
let apiUrl = config["API_URL"]
```

### Android (Kotlin)

```kotlin
import com.margelo.nitro.superconfig.NativeSuperConfig.config

// Access config values
val apiUrl = config["API_URL"]
```

### Cross Platform (cpp)

```cpp
#include "configGetter.hpp"

// Access config values
auto config = getActualConfig();
auto apiUrl = config["API_URL"];
```

## Using env vars in Info.plist & AndroidManifest.xml

superconfig can inject your `.env` values into `Info.plist` (iOS) and `AndroidManifest.xml` (Android), similar to `react-native-config`. This is **opt-in** to keep values out of your built app bundle by default.

### Enable the feature

Add this to your app's `package.json`:

```json
{
  "superconfig": {
    "injectBuildVars": true
  }
}
```

### iOS (Info.plist)

**No manual setup required.** When `injectBuildVars` is enabled, superconfig generates an xcconfig file at `npm install` time and the podspec automatically injects the values as Xcode build settings via `user_target_xcconfig`. After enabling, just run:

```bash
cd ios && pod install
```

Then reference your env vars in `Info.plist` using `$(VAR_NAME)` syntax:

```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>$(DEEP_LINK_SCHEME)</string>
        </array>
    </dict>
</array>
```

> **Note:** When you change your `.env` file, re-run `pod install` for iOS to pick up the new values.

### Android (AndroidManifest.xml)

Add the following to your app's `android/app/build.gradle` inside `defaultConfig`:

```groovy
defaultConfig {
    // ... existing config ...

    // Superconfig: inject env vars as manifest placeholders
    def envPropsFile = file("${rootProject.projectDir}/superconfig-env.properties")
    if (envPropsFile.exists()) {
        def envProps = new Properties()
        envProps.load(new FileInputStream(envPropsFile))
        envProps.each { key, value ->
            manifestPlaceholders[key] = value
        }
    }
}
```

Then reference your env vars in `AndroidManifest.xml` using `${VAR_NAME}` syntax:

```xml
<meta-data android:name="com.myapp.API_URL" android:value="${API_URL}" />

<intent-filter>
    <data android:scheme="${DEEP_LINK_SCHEME}" />
</intent-filter>
```

> **Important:** Add `superconfig-env.properties` and `superconfig-env.xcconfig` to your `.gitignore` — these are auto-generated files.

### Security Warning

When `injectBuildVars` is enabled, these env values **will be visible** in the built IPA/APK (inside `Info.plist` and `AndroidManifest.xml`).

## Performance and Benchmarks
| Library | Time | Performance |
|---------|------|-------------|
| **superconfig** | ~1.5ms | ⚡ **18x faster** |
| react-native-config | ~19.41ms | 🐌 baseline |

See [Benchmarks.md](BenchmarkApp/Benchmarks.md) and [BenchmarkApp](BenchmarkApp) for more details on how we tested this out. 

## Security

superconfig offers **better obfuscation** than traditional approaches like `BuildConfig.java`:

- ✅ Config values are compiled into native `.so` files (C++ binaries)
- ✅ Much harder to extract than plain text in `BuildConfig.java` or JavaScript bundles
- ⚠️ **Note**: While more secure, values can still be extracted using hexadecimal editors or reverse engineering tools

> **Important**: Never store highly sensitive secrets (like private keys) in your app bundle. Use secure backend APIs or platform-specific secure storage for truly sensitive data.



## License

MIT

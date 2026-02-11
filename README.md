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

## Types

> **Note**: A `superconfig.d.ts` file is auto-generated in your project root from your `.env` file, giving you full autocomplete and type checking out of the box.

### Type Safety Tips:
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

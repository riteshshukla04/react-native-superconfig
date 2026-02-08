# superconfig ⚡

**18x faster than react-native-config** 🚀

A blazing-fast configuration library for React Native, powered by [Nitro Modules](https://github.com/mrousavy/nitro). Access your environment variables with native performance through C++ bindings.

## Why superconfig?

- ⚡ **18x faster** than react-native-config
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

> **Note**: A `superconfig.d.ts` file is auto-generated in your project root from your `.env` file, giving you full autocomplete and type checking out of the box.

## How it works

superconfig uses a build-time script that:

1. Reads your `.env` file
2. Generates a C++ header file (`configGetter.hpp`) with your config values
3. Exposes them through Nitro Modules for instant access

This means **zero JavaScript bridge overhead** - your configs are accessed directly from native code!

## Performance

Benchmarked with 100,000 reads(See example app):

| Library | Time | Performance |
|---------|------|-------------|
| **superconfig** | ~1.5ms | ⚡ **18x faster** |
| react-native-config | ~19.41ms | 🐌 baseline |

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
import com.margelo.nitro.superconfig.config

// Access config values
val apiUrl = config["API_URL"]
```

## Security

superconfig offers **better obfuscation** than traditional approaches like `BuildConfig.java`:

- ✅ Config values are compiled into native `.so` files (C++ binaries)
- ✅ Much harder to extract than plain text in `BuildConfig.java` or JavaScript bundles
- ⚠️ **Note**: While more secure, values can still be extracted using hexadecimal editors or reverse engineering tools

> **Important**: Never store highly sensitive secrets (like private keys) in your app bundle. Use secure backend APIs or platform-specific secure storage for truly sensitive data.



## License

MIT

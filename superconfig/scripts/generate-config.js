#!/usr/bin/env node

/**
 * This script reads the .env file from the app root
 * and generates the configGetter.hpp file with the values
 * from the .env file as the config map.
 */

const fs = require('fs');
const path = require('path');

// Library root (where this script is located)
const libraryRoot = path.resolve(__dirname, '..');

/**
 * Helper: Check if a directory is a React Native app root
 */
function isReactNativeApp(dir) {
    try {
        const packageJsonPath = path.join(dir, 'package.json');
        if (!fs.existsSync(packageJsonPath)) {
            return false;
        }

        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

        // Check for react-native dependency
        const hasReactNative = !!(
            packageJson.dependencies?.['react-native'] ||
            packageJson.devDependencies?.['react-native']
        );

        // Check for ios/ or android/ directories
        const hasIosDir = fs.existsSync(path.join(dir, 'ios'));
        const hasAndroidDir = fs.existsSync(path.join(dir, 'android'));

        return hasReactNative && (hasIosDir || hasAndroidDir);
    } catch (error) {
        return false;
    }
}

/**
 * Strategy 3: Node Modules Detection (backward compatibility)
 */
function findAppRootFromNodeModules() {
    let currentDir = libraryRoot;

    // Walk up the directory tree to find node_modules
    while (currentDir !== path.dirname(currentDir)) {
        const parentDir = path.dirname(currentDir);
        const parentBasename = path.basename(parentDir);

        // Check if we're inside node_modules
        if (parentBasename === 'node_modules') {
            const appRoot = path.dirname(parentDir);
            // Validate it's actually a React Native app
            if (isReactNativeApp(appRoot)) {
                return { appRoot, strategy: 'node_modules' };
            }
        }

        // Check if parent is a scoped package (@scope)
        if (parentBasename.startsWith('@')) {
            const grandparentDir = path.dirname(parentDir);
            if (path.basename(grandparentDir) === 'node_modules') {
                const appRoot = path.dirname(grandparentDir);
                if (isReactNativeApp(appRoot)) {
                    return { appRoot, strategy: 'node_modules (scoped)' };
                }
            }
        }

        currentDir = parentDir;
    }

    return null;
}

/**
 * Strategy 4: Walk Up from Library Root
 */
function walkUpToFindApp(startDir, maxLevels = 5) {
    let currentDir = startDir;
    let level = 0;

    while (currentDir !== path.dirname(currentDir) && level < maxLevels) {
        // Check if current directory is a React Native app with .env
        if (isReactNativeApp(currentDir)) {
            const envPath = path.join(currentDir, '.env');
            if (fs.existsSync(envPath)) {
                return { appRoot: currentDir, strategy: 'walk_up' };
            }
        }

        currentDir = path.dirname(currentDir);
        level++;
    }

    return null;
}

/**
 * Helper: Check if an app depends on this library (via package.json)
 */
function appDependsOnLibrary(appDir, libraryPath) {
    try {
        const packageJsonPath = path.join(appDir, 'package.json');
        if (!fs.existsSync(packageJsonPath)) {
            return false;
        }

        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        const allDeps = {
            ...packageJson.dependencies,
            ...packageJson.devDependencies
        };

        // Check if any dependency points to our library (by path or name)
        for (const [name, version] of Object.entries(allDeps)) {
            // Check for path-based dependencies
            if (typeof version === 'string' && version.startsWith('.')) {
                const depPath = path.resolve(appDir, version);
                if (depPath === libraryPath) {
                    return true;
                }
            }
            // Check for name-based dependencies
            if (name.includes('superconfig') || name === '@margelo/superconfig') {
                return true;
            }
        }

        return false;
    } catch (error) {
        return false;
    }
}

/**
 * Strategy 5: Check common app locations in monorepo with hoisted dependencies
 */
function findAppInHoistedMonorepo(libraryDir) {
    // If we're in node_modules, the monorepo root is likely 2 levels up
    // Check for common app locations like example/, app/, etc.
    const parts = libraryDir.split(path.sep);
    const nodeModulesIndex = parts.lastIndexOf('node_modules');

    if (nodeModulesIndex !== -1) {
        // Monorepo root is before node_modules
        const monorepoRoot = parts.slice(0, nodeModulesIndex).join(path.sep);

        // Check common app directory names
        const commonAppDirs = ['example', 'app', 'apps', 'packages'];

        for (const dirName of commonAppDirs) {
            const candidateDir = path.join(monorepoRoot, dirName);
            if (fs.existsSync(candidateDir) && isReactNativeApp(candidateDir)) {
                const envPath = path.join(candidateDir, '.env');
                if (fs.existsSync(envPath)) {
                    return { appRoot: candidateDir, strategy: 'hoisted_monorepo' };
                }
            }
        }

        // Also check if monorepo root itself is the app
        if (isReactNativeApp(monorepoRoot)) {
            const envPath = path.join(monorepoRoot, '.env');
            if (fs.existsSync(envPath)) {
                return { appRoot: monorepoRoot, strategy: 'hoisted_monorepo_root' };
            }
        }
    }

    return null;
}

/**
 * Strategy 6: Monorepo Sibling Search
 */
function findAppInMonorepo(libraryDir) {
    const parentDir = path.dirname(libraryDir);
    const libraryName = path.basename(libraryDir);

    try {
        const siblings = fs.readdirSync(parentDir, { withFileTypes: true });
        const apps = [];
        const appsWithDependency = [];

        for (const sibling of siblings) {
            if (sibling.isDirectory()) {
                const siblingPath = path.join(parentDir, sibling.name);

                // Skip node_modules, hidden directories, and the library itself
                if (sibling.name === 'node_modules' ||
                    sibling.name.startsWith('.') ||
                    sibling.name === libraryName) {
                    continue;
                }

                // Check if it's a React Native app with .env
                if (isReactNativeApp(siblingPath)) {
                    const envPath = path.join(siblingPath, '.env');
                    if (fs.existsSync(envPath)) {
                        apps.push(siblingPath);

                        // Check if this app explicitly depends on the library
                        if (appDependsOnLibrary(siblingPath, libraryDir)) {
                            appsWithDependency.push(siblingPath);
                        }
                    }
                }
            }
        }

        // Prefer apps that explicitly depend on this library
        if (appsWithDependency.length === 1) {
            return { appRoot: appsWithDependency[0], strategy: 'monorepo_sibling (by_dependency)' };
        } else if (appsWithDependency.length > 1) {
            console.warn('[Superconfig] ⚠️  Multiple apps with superconfig dependency found:');
            appsWithDependency.forEach(app => console.warn(`  - ${path.basename(app)}`));
            console.warn('[Superconfig] ⚠️  Set SUPERCONFIG_APP_ROOT to specify which app to use.');
            return { appRoot: appsWithDependency[0], strategy: 'monorepo_sibling (multiple_with_dep)' };
        }

        // Fall back to any React Native app found
        if (apps.length === 1) {
            return { appRoot: apps[0], strategy: 'monorepo_sibling' };
        } else if (apps.length > 1) {
            console.warn('[Superconfig] ⚠️  Multiple React Native apps found in monorepo:');
            apps.forEach(app => console.warn(`  - ${path.basename(app)}`));
            console.warn('[Superconfig] ⚠️  Using first app. Set SUPERCONFIG_APP_ROOT to override.');
            return { appRoot: apps[0], strategy: 'monorepo_sibling (multiple)' };
        }
    } catch (error) {
        // Ignore errors reading directory
    }

    return null;
}

/**
 * Multi-strategy app root detection
 */
function findAppRoot() {
    // Strategy 1: Environment Variable Override
    if (process.env.SUPERCONFIG_APP_ROOT) {
        const appRoot = path.resolve(process.env.SUPERCONFIG_APP_ROOT);
        if (fs.existsSync(appRoot) && isReactNativeApp(appRoot)) {
            return { appRoot, strategy: 'environment_variable' };
        } else {
            console.warn(`[Superconfig] ⚠️  SUPERCONFIG_APP_ROOT set but invalid: ${appRoot}`);
        }
    }

    // Strategy 2: Process Working Directory Check
    const cwd = process.cwd();
    if (isReactNativeApp(cwd)) {
        const envPath = path.join(cwd, '.env');
        if (fs.existsSync(envPath)) {
            return { appRoot: cwd, strategy: 'process_cwd' };
        }
    }

    // Strategy 3: Node Modules Detection (backward compatibility)
    const nodeModulesResult = findAppRootFromNodeModules();
    if (nodeModulesResult) {
        return nodeModulesResult;
    }

    // Strategy 4: Walk Up from Library Root
    const walkUpResult = walkUpToFindApp(path.dirname(libraryRoot));
    if (walkUpResult) {
        return walkUpResult;
    }

    // Strategy 5: Check for hoisted monorepo setup (node_modules at root)
    const hoistedResult = findAppInHoistedMonorepo(libraryRoot);
    if (hoistedResult) {
        return hoistedResult;
    }

    // Strategy 6: Monorepo Sibling Search
    const monorepoResult = findAppInMonorepo(libraryRoot);
    if (monorepoResult) {
        return monorepoResult;
    }

    // No app root found
    return { appRoot: libraryRoot, strategy: 'fallback (library_root)' };
}

// Paths
const { appRoot, strategy } = findAppRoot();
const envPath = path.join(appRoot, '.env');
const outputPath = path.join(libraryRoot, 'cpp', 'configGetter.hpp');

console.log('[Superconfig] 🔧 Generating config...');
console.log('  Library root:', libraryRoot);
console.log('  App root:', appRoot);
console.log('  Detection strategy:', strategy);
console.log('  .env path:', envPath);
console.log('  Output path:', outputPath);

/**
 * Robust .env parser
 */
function parseEnv(content) {
    const config = {};
    const lines = content.split(/\r?\n/);

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();

        // Skip empty lines and full-line comments
        if (!line || line.startsWith('#')) continue;

        // Find the first equals sign
        const eqIdx = line.indexOf('=');
        if (eqIdx === -1) continue;

        const key = line.substring(0, eqIdx).trim();

        // Skip empty keys
        if (!key) continue;

        // Handle export prefix
        if (key.toLowerCase().startsWith('export ')) {
            const actualKey = key.substring(7).trim();
            // Recurse to handle the rest of the line as a normal assignment
            // But here we can just update 'key' since our logic below just uses 'value'
            // A simpler way is to just ignore 'export ' prefix on key.
            // Let's restart processing this line logic with modified line if needed, 
            // but simpler is just stripping it from key:
        }

        // Re-process key to remove 'export ' if present
        let finalKey = key;
        if (finalKey.startsWith('export ')) {
            finalKey = finalKey.substring(7).trim();
        }

        let value = line.substring(eqIdx + 1).trim();

        // Handle quoted values
        if (value.startsWith('"')) {
            // Double quoted: supports newlines, escapes
            let endIdx = -1;
            let currentVal = '';

            // If the value is simply empty quotes ""
            if (value === '""') {
                config[finalKey] = "";
                continue;
            }

            // We need to parse explicitly to handle escapes and multiline
            // Logic: start after first quote
            // Iterate chars. If backslash, take next char literally (or handle specific escapes).
            // If quote (unsescaped), we are done.
            // If newline (end of line string), continue to next line in 'lines' array.

            let parsed = "";
            let escaped = false;
            let completed = false;

            // Start parsing from character 1 (after opening quote)
            // But we might span multiple lines, so we need a cursor state

            // Let's reconstruct the raw multiline string first, then parse
            let rawBuffer = value.substring(1); // remove leading "
            let lineOffset = 0;

            while (!completed) {
                for (let j = 0; j < rawBuffer.length; j++) {
                    const char = rawBuffer[j];

                    if (escaped) {
                        // Handle parsed escape sequences
                        if (char === 'n') parsed += '\n';
                        else if (char === 't') parsed += '\t';
                        else if (char === 'r') parsed += '\r';
                        else parsed += char; // literal for others like \", \\, \$
                        escaped = false;
                    } else {
                        if (char === '\\') {
                            escaped = true;
                        } else if (char === '"') {
                            completed = true;
                            // check for inline comments after closing quote?
                            // We ignore anything after the closing quote for now
                            break;
                        } else {
                            parsed += char;
                        }
                    }
                }

                if (completed) break;

                // If we ran out of buffer but not closed, read next line
                lineOffset++;
                if (i + lineOffset >= lines.length) {
                    // End of file inside quote
                    completed = true;
                    if (escaped) {
                        // Trailing backslash at EOF... just ignore
                    }
                } else {
                    // Add newline character literal to value because it was a physical newline in file
                    parsed += '\n';
                    rawBuffer = lines[i + lineOffset].trimEnd(); // .env usually preserves indentation? No, usually distinct lines.
                    // Actually standard .env parsing often treats physical newline as newline.
                    // But wait, if previous line ended with \, it might be line continuation?
                    // Standard dotenv: "Double quotes expand newlines"
                    // Let's assume just appending the next line's content.
                    // But we generated 'rawBuffer' from 'value' which was trimmed.
                    // For multiline strings, we might want to preserve structure.
                    // Let's retry: read raw lines for multiline
                    rawBuffer = lines[i + lineOffset];
                }
            }

            config[finalKey] = parsed;
            i += lineOffset; // Skip processed lines

        } else if (value.startsWith("'")) {
            // Single quoted: Literal value, no escapes, but can span lines? 
            // Usually single quotes are strict literals.
            if (value === "''") {
                config[finalKey] = "";
                continue;
            }

            let parsed = "";
            let completed = false;
            let rawBuffer = value.substring(1);
            let lineOffset = 0;

            while (!completed) {
                const closeIdx = rawBuffer.indexOf("'");
                if (closeIdx !== -1) {
                    parsed += rawBuffer.substring(0, closeIdx);
                    completed = true;
                } else {
                    parsed += rawBuffer;
                    lineOffset++;
                    if (i + lineOffset >= lines.length) {
                        completed = true;
                    } else {
                        parsed += '\n';
                        rawBuffer = lines[i + lineOffset];
                    }
                }
            }
            config[finalKey] = parsed;
            i += lineOffset;

        } else {
            // Unquoted value
            // Stop at first # which isn't followed by anything?
            // Simple rule: comment starts at # preceded by space? or just #?
            // "val #comment" -> val
            // "val#comment" -> val#comment (maybe?)
            // Let's stick to standard: comment is #

            let cleanValue = value;
            const commentIdx = value.indexOf('#');
            if (commentIdx !== -1) {
                // If it's effectively a comment (preceded by space or is just #)
                // But URLs like http://...#frag are valid.
                // We'll trust that uncommented values are simple. 
                // A robust heuristic: if there is a space before #, it's a comment.
                const preComment = value.substring(0, commentIdx);
                if (preComment.endsWith(' ') || preComment.length === 0) {
                    cleanValue = preComment.trim();
                } else {
                    // It might be part of the value (like a color code or URL fragment)
                    // But wait, standard dotenv says: "Comments may be added ... inline"
                    // We will take everything before the first # 
                    // Refined: usually inline comments have space before them.
                    // Let's check for " #"
                    const spacedCommentIdx = value.indexOf(' #');
                    if (spacedCommentIdx !== -1) {
                        cleanValue = value.substring(0, spacedCommentIdx).trim();
                    } else if (value.startsWith('#')) {
                        cleanValue = "";
                    }
                }
            }

            // Resolve variables ${VAR}
            // For now, let's just strip surrounding whitespace
            config[finalKey] = cleanValue.trim();
        }
    }
    return config;
}

function escapeForCpp(str) {
    if (str === null || str === undefined) return '';
    // Escape backslashes first, then quotes, newlines, tabs
    return str.toString()
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\t/g, '\\t')
        .replace(/\r/g, '\\r');
}

/**
 * Generate the TypeScript declaration file content
 */
function generateTypeDeclaration(config) {
    const keys = Object.keys(config);

    let properties = '';
    if (keys.length > 0) {
        properties = keys
            .map((key) => `    ${key}: string;`)
            .join('\n');
    }

    return `// auto-generated by superconfig - DO NOT EDIT MANUALLY
export interface SuperConfig {
${properties}
}
declare const Config: SuperConfig;
export default Config;
`;
}

/**
 * Generate the C++ header file content
 */
function generateCppHeader(config) {
    const entries = Object.entries(config);
    let mapEntries = '';

    if (entries.length > 0) {
        mapEntries = entries
            .map(([key, value]) => `        {"${escapeForCpp(key)}", "${escapeForCpp(value)}"}`)
            .join(',\n');
    }

    return `//
//  configGetter.hpp
//  Pods
//
//  Auto-generated from .env file - DO NOT EDIT MANUALLY
//
//

#pragma once
#include <unordered_map>
#include <string>

inline std::unordered_map<std::string, std::string> getActualConfig() {
    return {
${mapEntries}
    };
}
`;
}

// Main execution
if (fs.existsSync(envPath)) {
    const rawContent = fs.readFileSync(envPath, 'utf-8');
    const config = parseEnv(rawContent);
    console.log(`[Superconfig] 📦 Found ${Object.keys(config).length} config entries`);

    // Log keys for debugging
    // console.log(config);

    const cppContent = generateCppHeader(config);
    fs.writeFileSync(outputPath, cppContent, 'utf-8');
    console.log('[Superconfig] ✅ Generated configGetter.hpp');
    const libDir = path.join(libraryRoot, 'lib');
    const dtsOutputPath = fs.existsSync(libDir)
        ? path.join(libDir, 'superconfig.d.ts')
        : path.join(appRoot, 'superconfig.d.ts');
    const dtsContent = generateTypeDeclaration(config);
    fs.writeFileSync(dtsOutputPath, dtsContent, 'utf-8');
    console.log('[Superconfig] ✅ Generated superconfig.d.ts');
} else {
    console.warn(`[Superconfig] ⚠️  .env file not found at ${envPath}`);
    console.warn(`[Superconfig] ⚠️  Detection strategy used: ${strategy}`);
    console.warn('[Superconfig] ⚠️  To explicitly set app root, use: SUPERCONFIG_APP_ROOT=/path/to/app');
    // Create empty config
    const cppContent = generateCppHeader({});
    fs.writeFileSync(outputPath, cppContent, 'utf-8');
    console.log('[Superconfig] ⚠️  Generated empty configGetter.hpp');
}

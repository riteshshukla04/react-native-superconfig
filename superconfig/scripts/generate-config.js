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

// Find app root by looking for parent of node_modules
function findAppRoot() {
    let currentDir = libraryRoot;

    // Walk up the directory tree to find the app root
    while (currentDir !== path.dirname(currentDir)) {
        // Check if we're inside node_modules
        if (path.basename(path.dirname(currentDir)) === 'node_modules') {
            // App root is the parent of node_modules
            return path.dirname(path.dirname(currentDir));
        }
        currentDir = path.dirname(currentDir);
    }

    // Fallback for local development
    const exampleEnv = path.join(libraryRoot, '..', 'example', '.env');
    if (fs.existsSync(exampleEnv)) {
        return path.join(libraryRoot, '..', 'example');
    }

    // Last fallback: use library root itself
    return libraryRoot;
}

// Paths
const appRoot = findAppRoot();
const envPath = path.join(appRoot, '.env');
const outputPath = path.join(libraryRoot, 'cpp', 'configGetter.hpp');

console.log('[Superconfig] 🔧 Generating config...');
console.log('  App root:', appRoot);
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
} else {
    console.warn(`[Superconfig] ⚠️  .env file not found at ${envPath}`);
    // Create empty config
    const cppContent = generateCppHeader({});
    fs.writeFileSync(outputPath, cppContent, 'utf-8');
    console.log('[Superconfig] ⚠️  Generated empty configGetter.hpp');
}

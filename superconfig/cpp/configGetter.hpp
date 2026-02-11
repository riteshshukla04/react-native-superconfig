//
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
        {"PORT", "3000"},
        {"NODE_ENV", "development"},
        {"HOST", "localhost"},
        {"ENABLE_CACHE", "true"}
    };
}

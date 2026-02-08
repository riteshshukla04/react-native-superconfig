//
//  ConfigGetter.mm
//  NitroSuperconfig
//
//  Created by Ritesh Shukla on 08/02/26.
//

#import "ConfigGetter.h"
#import "../cpp/configGetter.hpp"
#import <string>
#import <unordered_map>

@implementation ConfigGetter

+ (NSDictionary<NSString *, NSString *> *)getNativeConfig {
  std::unordered_map<std::string, std::string> config = getActualConfig();
  NSMutableDictionary<NSString *, NSString *> *result =
      [NSMutableDictionary new];

  for (const auto &pair : config) {
    NSString *key = [NSString stringWithUTF8String:pair.first.c_str()];
    NSString *value = [NSString stringWithUTF8String:pair.second.c_str()];
    result[key] = value;
  }

  return result;
}

@end

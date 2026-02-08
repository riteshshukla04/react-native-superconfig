//
//  ConfigGetter.h
//  NitroSuperconfig
//
//  Created by Ritesh Shukla on 08/02/26.
//

#pragma once

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface ConfigGetter : NSObject

+ (NSDictionary<NSString *, NSString *> *)getNativeConfig;

@end

NS_ASSUME_NONNULL_END

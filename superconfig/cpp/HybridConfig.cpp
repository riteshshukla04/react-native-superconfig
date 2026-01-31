//
//  HybridConfig.cpp
//  Pods
//
//  Created by Ritesh Shukla on 22/01/26.
//

#include "HybridConfig.hpp"
#include "configGetter.hpp"

namespace  margelo::nitro::superconfig {
    std::unordered_map<std::string, std::string> HybridConfig::getConfig(){
        return getActualConfig();
    }

    void HybridConfig::setConfig(const std::unordered_map<std::string, std::string>& Config){
        // Do Nothing
    }

  
    
}

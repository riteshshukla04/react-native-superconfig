//
//  HybridConfig.hpp
//  Pods
//
//  Created by Ritesh Shukla on 22/01/26.
//
#include "HybridConfigSpec.hpp"


namespace margelo::nitro::superconfig {
    class HybridConfig final: public HybridConfigSpec {
    public:
        HybridConfig():HybridObject(TAG){};
        std::unordered_map<std::string, std::string> getConfig() override;
        void setConfig(const std::unordered_map<std::string, std::string>& Config) override;



    };
}

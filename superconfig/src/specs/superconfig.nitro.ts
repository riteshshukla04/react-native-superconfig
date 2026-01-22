// TODO: Export specs that extend HybridObject<...> here


import { NitroModules, type HybridObject } from 'react-native-nitro-modules'



export interface Config extends HybridObject<{ android: 'c++', ios: 'c++' }> {
    getConfig(): Record<string, string>
}
const nitroConfig = NitroModules.createHybridObject<Config>("Config")


let Config:Record<string, string>= {}

if(!Object.keys(Config).length){
    Config = nitroConfig.getConfig()
}

export default Config

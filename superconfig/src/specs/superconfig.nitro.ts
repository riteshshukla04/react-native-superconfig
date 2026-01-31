// TODO: Export specs that extend HybridObject<...> here


import { NitroModules, type HybridObject } from 'react-native-nitro-modules'



export interface Config extends HybridObject<{ android: 'c++', ios: 'c++' }> {
    Config: Record<string, string>
}
const nitroConfig = NitroModules.createHybridObject<Config>("Config")


let Config:Record<string, string> | undefined = undefined

if(!Config){
    Config = nitroConfig.Config as Record<string, string>
}

export default Config

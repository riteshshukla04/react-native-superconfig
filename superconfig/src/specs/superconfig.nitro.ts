import { NitroModules, type HybridObject } from 'react-native-nitro-modules'

export interface Config extends HybridObject<{ android: 'c++', ios: 'c++' }> {
  Config: Record<string, string>
}
const nitroConfig = NitroModules.createHybridObject<Config>('Config')

export interface SuperConfig {
  [key: string]: string
}

let Config: SuperConfig | undefined

if (!Config) {
  Config = nitroConfig.Config
}

export default Config as SuperConfig

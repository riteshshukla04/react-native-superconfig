import { NitroModules, type HybridObject } from 'react-native-nitro-modules'

export interface Config extends HybridObject<{ android: 'c++', ios: 'c++' }> {
  Config: Record<string, string>
}
const nitroConfig = NitroModules.createHybridObject<Config>('Config')

const Config = nitroConfig.Config

export default Config

import { InjectionToken } from 'cewdi'
import { ModuleLoadConfig } from './module-load-config'

export const moduleLoadConfigToken = new InjectionToken<ModuleLoadConfig>('ModuleLoadConfig')

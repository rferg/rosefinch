import { ModuleName } from './module-name'
import { Module } from './module'

export type ModuleLoadConfig = {
    [moduleName in ModuleName]: {
        parentModule?: ModuleName
        loader: () => Promise<{ default?: Module }>
    }
}

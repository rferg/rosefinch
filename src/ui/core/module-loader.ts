import { ElementRegistrar, Inject, Injectable, InjectionContainer } from 'cewdi'
import { ModuleName } from './module-name'
import { ModuleLoadConfig } from './module-load-config'
import { moduleLoadConfigToken } from './module-load-config-token'
import { Module } from './module'
import { customElementRegistryToken } from './custom-element-registry-token'

@Injectable()
export class ModuleLoader {
    private rootContainer?: InjectionContainer
    private readonly moduleContainers = new Map<ModuleName, InjectionContainer>()

    constructor(
        @Inject(customElementRegistryToken) private readonly customElementRegistry: CustomElementRegistry,
        @Inject(moduleLoadConfigToken) private readonly config: ModuleLoadConfig) {}

    registerRoot(module: Module, injectionContainer: InjectionContainer): void {
        if (this.rootContainer) {
            throw new Error('Attempted to register root module, but one is already registered.')
        }
        this.rootContainer = injectionContainer
        if (module.elements.length) {
            const registrar = new ElementRegistrar(this.rootContainer, this.customElementRegistry)
            registrar.register(...module.elements)
        }
    }

    async load(name: ModuleName): Promise<void> {
        if (this.moduleContainers.has(name)) {
            return
        }

        if (!this.rootContainer) {
            throw new Error(`Attempted to load module ${name} without registering root module.` +
                ` Call registerRoot() before loading any child modules.`)
        }

        const config = this.config[name]
        if (!config) {
            throw new Error(`No config found to load module ${name}.`)
        }

        const parentContainer = await this.getParentContainer(this.rootContainer, config.parentModule)

        const { providers, elements } = await this.callLoader(config.loader)
        const container = parentContainer.createChildContainer(providers)
        this.moduleContainers.set(name, container)
        if (elements.length) {
            new ElementRegistrar(container, this.customElementRegistry)
                .register(...elements)
        }
    }

    private async getParentContainer(root: InjectionContainer, parentName?: ModuleName): Promise<InjectionContainer> {
        if (!parentName) { return root }

        if (!this.moduleContainers.has(parentName)) {
            await this.load(parentName)
        }

        const parentContainer = this.moduleContainers.get(parentName)
        if (!parentContainer) {
            throw new Error(`Failed to load parent module ${parentName}.`)
        }

        return parentContainer
    }

    private async callLoader(loader: () => Promise<{ default?: Module }>): Promise<Module> {
        const result = await loader()
        if (this.isModule(result?.default)) {
            return result.default
        }
        throw new Error(`Failed to load module using ${loader.toString()}. Received: ${result}`)
    }

    private isModule(obj: any): obj is Module {
        return !!((obj as Module)?.elements && (obj as Module)?.providers)
    }
}

import { ElementRegistrar, Inject, Injectable, InjectionContainer } from 'cewdi'
import { ModuleName } from './module-name'
import { ModuleLoadConfig } from './module-load-config'
import { moduleLoadConfigToken } from './module-load-config-token'
import { Module } from './module'
import { customElementRegistryToken } from './custom-element-registry-token'
import { globalEventTargetToken } from '../../common/global-event-target-token'
import { PendingStateEvent } from '../common/pending-state-event'
import { Route } from './route'

type ModuleSubRoutes = { module: ModuleName, routes: Route[] | undefined }
@Injectable()
export class ModuleLoader {
    private rootContainer?: InjectionContainer
    private readonly moduleContainers = new Map<ModuleName, InjectionContainer>()

    constructor(
        @Inject(customElementRegistryToken) private readonly customElementRegistry: CustomElementRegistry,
        @Inject(moduleLoadConfigToken) private readonly config: ModuleLoadConfig,
        @Inject(globalEventTargetToken) private readonly eventTarget: EventTarget) {}

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

    async load(name: ModuleName, subRoutes: ModuleSubRoutes[] = []): Promise<ModuleSubRoutes[]> {
        if (this.moduleContainers.has(name)) {
            return subRoutes
        }

        if (!this.rootContainer) {
            throw new Error(`Attempted to load module ${name} without registering root module.` +
                ` Call registerRoot() before loading any child modules.`)
        }

        const config = this.config[name]
        if (!config) {
            throw new Error(`No config found to load module ${name}.`)
        }
        const parentContainer = await this.getParentContainer(this.rootContainer, subRoutes, config.parentModule)

        const { providers, elements, routes } = await this.callLoader(config.loader)
        subRoutes.push({ module: name, routes })
        const container = parentContainer.createChildContainer(providers)
        this.moduleContainers.set(name, container)
        if (elements.length) {
            new ElementRegistrar(container, this.customElementRegistry)
                .register(...elements)
        }

        return subRoutes
    }

    private async getParentContainer(
        root: InjectionContainer,
        subRoutes: ModuleSubRoutes[],
        parentName?: ModuleName): Promise<InjectionContainer> {
        if (!parentName) { return root }

        if (!this.moduleContainers.has(parentName)) {
            await this.load(parentName, subRoutes)
        }

        const parentContainer = this.moduleContainers.get(parentName)
        if (!parentContainer) {
            throw new Error(`Failed to load parent module ${parentName}.`)
        }

        return parentContainer
    }

    private async callLoader(loader: () => Promise<{ default?: Module }>): Promise<Module> {
        let resolveIndicator: Function | undefined
        this.eventTarget.dispatchEvent(
            new PendingStateEvent(new Promise(resolve => { resolveIndicator = resolve })))

        try {
            const result = await loader()
            if (this.isModule(result?.default)) {
                return result.default
            }
            throw new Error(`Failed to load module using ${loader.toString()}. Received: ${result}`)
        } finally {
            if (resolveIndicator) { resolveIndicator() }
        }
    }

    private isModule(obj: any): obj is Module {
        return !!((obj as Module)?.elements && (obj as Module)?.providers)
    }
}

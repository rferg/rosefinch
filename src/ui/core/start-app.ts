import { Module } from './module'
import { InjectionContainer } from 'cewdi'
import { ModuleLoader } from './module-loader'
import { ClassTypeToken } from 'cewdi/dist/src/injection'
import { Route } from './route'
import { Router } from './router'

export async function startApp({
    rootModule,
    customElementRegistry,
    routes
}: {
    rootModule: Module,
    customElementRegistry: CustomElementRegistry,
    routes: Route[]
}): Promise<void> {
    const injectionContainer = InjectionContainer.create(rootModule.providers)
    const whenElementsDefined = rootModule.elements
        .map(element => customElementRegistry.whenDefined(element.name))
    const moduleLoader = injectionContainer.resolve<ModuleLoader>(new ClassTypeToken(ModuleLoader))
    moduleLoader.registerRoot(rootModule, injectionContainer)
    const router = injectionContainer.resolve<Router>(new ClassTypeToken(Router))
    await Promise.all(whenElementsDefined)
    router.registerRoutes(routes)
}

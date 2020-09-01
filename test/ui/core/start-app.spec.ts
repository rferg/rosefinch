import { Router } from '../../../src/ui/core/router'
import { ModuleLoader } from '../../../src/ui/core/module-loader'
import { InjectionContainer } from 'cewdi'
import { Module } from '../../../src/ui/core/module'
import { startApp } from '../../../src/ui/core/start-app'
import { Route } from '../../../src/ui/core/route'

describe('startApp', () => {
    let registrySpy: jasmine.SpyObj<CustomElementRegistry>
    let routerSpy: jasmine.SpyObj<Router>
    let moduleLoaderSpy: jasmine.SpyObj<ModuleLoader>
    let icSpy: jasmine.SpyObj<InjectionContainer>

    beforeEach(() => {
        routerSpy = jasmine.createSpyObj<Router>('Router', [ 'registerRoutes' ])
        moduleLoaderSpy = jasmine.createSpyObj<ModuleLoader>('ModuleLoader', [ 'registerRoot' ])
        registrySpy = jasmine.createSpyObj<CustomElementRegistry>('CustomElementRegistry', [ 'whenDefined' ])
        registrySpy.whenDefined.and.returnValue(Promise.resolve())
        icSpy = jasmine.createSpyObj<InjectionContainer>('InjectionContainer', [ 'resolve' ])
        spyOn(InjectionContainer, 'create').and.returnValue(icSpy)
        icSpy.resolve.and.returnValues(moduleLoaderSpy, routerSpy)
    })

    it('should register root module with moduleLoader', async () => {
        const rootModule: Module = {
            elements: [],
            providers: []
        }

        await startApp({ rootModule, routes: [], customElementRegistry: registrySpy })

        expect(moduleLoaderSpy.registerRoot).toHaveBeenCalledWith(rootModule, icSpy)
    })

    it('should register routes with router after elements defined', async () => {
        const rootModule: Module = {
            elements: [
                {
                    element: class El extends HTMLElement {},
                    name: 'test-el'
                }
            ],
            providers: []
        }
        const routes: Route[] = [
            { path: '*', elementName: 'div' }
        ]

        await startApp({ rootModule, routes, customElementRegistry: registrySpy })

        expect(routerSpy.registerRoutes).toHaveBeenCalledWith(routes)
        rootModule.elements.forEach(({ name }) => expect(registrySpy.whenDefined).toHaveBeenCalledWith(name))
        expect(registrySpy.whenDefined).toHaveBeenCalledBefore(routerSpy.registerRoutes)
    })
})

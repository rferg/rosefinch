import { ModuleLoader } from '../../../src/ui/core/module-loader'
import { ModuleLoadConfig } from '../../../src/ui/core/module-load-config'
import { Module } from '../../../src/ui/core/module'
import { ElementRegistration, Injectable, InjectionContainer } from 'cewdi'
import { ModuleName } from '../../../src/ui/core/module-name'
import { PendingStateEvent } from '../../../src/ui/common/pending-state-event'

@Injectable()
class CustomEl extends HTMLElement {
    static get is() { return 'custom-el' }
}

describe('ModuleLoader', () => {
    let loader: ModuleLoader
    let registrySpy: jasmine.SpyObj<CustomElementRegistry>
    let containerSpy: jasmine.SpyObj<InjectionContainer>
    let eventSpy: jasmine.SpyObj<EventTarget>

    beforeEach(() => {
        registrySpy = jasmine.createSpyObj<CustomElementRegistry>('CustomElementRegistry', [ 'define' ])
        containerSpy = jasmine.createSpyObj<InjectionContainer>('InjectionContainer', [ 'createChildContainer' ])
        eventSpy = jasmine.createSpyObj<EventTarget>('EventTarget', [ 'dispatchEvent' ])
        containerSpy.createChildContainer.and.returnValue(containerSpy)
    })

    describe('registerRoot', () => {
        beforeEach(() => {
            loader = new ModuleLoader(registrySpy, {} as ModuleLoadConfig, eventSpy)
        })

        it('should throw if called twice', () => {
            const module: Module = { providers: [], elements: [] }

            loader.registerRoot(module, containerSpy)

            expect(() => loader.registerRoot(module, containerSpy))
                .toThrowError(/already registered/i)
        })

        it('should register any elements', () => {
            const element: ElementRegistration = {
                element: CustomEl,
                name: 'custom-el'
            }
            const module: Module = {
                providers: [],
                elements: [ element ]
            }

            loader.registerRoot(module, containerSpy)

            expect(registrySpy.define).toHaveBeenCalledWith(
                element.name,
                jasmine.any(Function),
                undefined)
        })
    })

    describe('load', () => {
        let config: ModuleLoadConfig

        beforeEach(() => {
            config = {
                [ModuleName.Common]: {
                    loader: jasmine.createSpy('CommonLoader')
                },
                [ModuleName.NewSession]: {
                    loader: jasmine.createSpy('CommonLoader')
                },
                [ModuleName.Representatives]: {
                    parentModule: ModuleName.Common,
                    loader: jasmine.createSpy('RepresentativeDisplayLoader')
                },
                [ModuleName.Audio]: {
                    loader: jasmine.createSpy('AudioLoader'),
                    parentModule: ModuleName.Representatives
                },
                [ModuleName.Options]: {
                    loader: jasmine.createSpy('OptionsLoader')
                },
                [ModuleName.Pipeline]: {
                    loader: jasmine.createSpy('PipelineLoader')
                }
            }

            loader = new ModuleLoader(registrySpy, config, eventSpy)
        })

        it('should throw if no root container registered', async () => {
            await expectAsync(loader.load(ModuleName.Common))
                .toBeRejectedWithError(/without registering root module/i)
        })

        it('should throw if config loader returns nothing', async () => {
            loader.registerRoot({ providers: [], elements: [] }, containerSpy)

            await expectAsync(loader.load(ModuleName.Common))
                .toBeRejectedWithError(/failed to load module/i)
        })

        it('should throw if config loader returns no default property', async () => {
            (config.Common.loader as jasmine.Spy).and.returnValue(Promise.resolve({ prop: 1 }))
            loader.registerRoot({ providers: [], elements: [] }, containerSpy)

            await expectAsync(loader.load(ModuleName.Common))
                .toBeRejectedWithError(/failed to load module/i)
        })

        it('should throw if config loader returns no default property that is not Module', async () => {
            (config.Common.loader as jasmine.Spy).and.returnValue(Promise.resolve({ default: { prop: 1 } }))
            loader.registerRoot({ providers: [], elements: [] }, containerSpy)

            await expectAsync(loader.load(ModuleName.Common))
                .toBeRejectedWithError(/failed to load module/i)
        })

        it('should load and register elements', async () => {
            loader.registerRoot({ providers: [], elements: [] }, containerSpy)
            const module: Module = {
                providers: [],
                elements: [
                    {
                        name: CustomEl.is,
                        element: CustomEl
                    }
                ]
            };
            (config.Common.loader as jasmine.Spy).and.returnValue(
                Promise.resolve({ default: module }))

            await loader.load(ModuleName.Common)

            expect(registrySpy.define).toHaveBeenCalledWith(CustomEl.is, jasmine.any(Function), undefined)
            expect(containerSpy.createChildContainer).toHaveBeenCalledWith(module.providers)
        })

        it('should dispatch PendingStateEvent with indicator promise that resolves when loading finishes',
            async () => {
                loader.registerRoot({ providers: [], elements: [] }, containerSpy)
                const module: Module = {
                    providers: [],
                    elements: [
                        {
                            name: CustomEl.is,
                            element: CustomEl
                        }
                    ]
                };
                (config.Common.loader as jasmine.Spy).and.returnValue(Promise.resolve({ default: module }))

                await loader.load(ModuleName.Common)

                expect(eventSpy.dispatchEvent).toHaveBeenCalledWith(jasmine.any(PendingStateEvent))
                await expectAsync((eventSpy.dispatchEvent.calls.mostRecent().args[0] as PendingStateEvent).waitOn)
                    .toBeResolved()
        })

        it('should load and register elements if parent already loaded', async () => {
            loader.registerRoot({ providers: [], elements: [] }, containerSpy)
            const commonModule: Module = {
                providers: [],
                elements: [
                    {
                        name: CustomEl.is,
                        element: CustomEl
                    }
                ]
            };
            (config.Common.loader as jasmine.Spy).and.returnValue(
                Promise.resolve({ default: commonModule }))
            await loader.load(ModuleName.Common)
            const rdModule: Module = {
                providers: [],
                elements: [
                    {
                        name: 'rd-el',
                        element: CustomEl
                    }
                ]
            };
            (config.RepresentativeDisplay.loader as jasmine.Spy).and.returnValue(Promise.resolve({ default: rdModule }))

            await loader.load(ModuleName.Representatives)

            expect(registrySpy.define).toHaveBeenCalledWith(
                rdModule.elements[0].name,
                jasmine.any(Function),
                undefined
            )
            expect(config.Common.loader as jasmine.Spy).toHaveBeenCalledTimes(1)
        })

        it('should load all parents that have not been loaded yet', async () => {
            loader.registerRoot({ providers: [], elements: [] }, containerSpy)
            const commonModule: Module = {
                providers: [],
                elements: [
                    {
                        name: 'common-el',
                        element: CustomEl
                    }
                ]
            };
            (config.Common.loader as jasmine.Spy)
                .and.returnValue(Promise.resolve({ default: commonModule }))
            const rdModule: Module = {
                providers: [],
                elements: [
                    {
                        name: 'rd-el',
                        element: CustomEl
                    }
                ]
            };
            (config.RepresentativeDisplay.loader as jasmine.Spy)
                .and.returnValue(Promise.resolve({ default: rdModule }))
                const audioModule: Module = {
                    providers: [],
                    elements: [
                        {
                            name: 'audio-el',
                            element: CustomEl
                        }
                    ]
                };
                (config.Audio.loader as jasmine.Spy)
                    .and.returnValue(Promise.resolve({ default: audioModule }))

            await loader.load(ModuleName.Audio)

            expect(registrySpy.define)
                .toHaveBeenCalledWith(commonModule.elements[0].name, jasmine.any(Function), undefined)
            expect(registrySpy.define)
                .toHaveBeenCalledWith(rdModule.elements[0].name, jasmine.any(Function), undefined)
            expect(registrySpy.define)
                .toHaveBeenCalledWith(audioModule.elements[0].name, jasmine.any(Function), undefined)
        })

        it('should load and register elements once', async () => {
            loader.registerRoot({ providers: [], elements: [] }, containerSpy)
            const module: Module = {
                providers: [],
                elements: [
                    {
                        name: CustomEl.is,
                        element: CustomEl
                    }
                ]
            };
            (config.Common.loader as jasmine.Spy).and.returnValue(
                Promise.resolve({ default: module }))

            await loader.load(ModuleName.Common)
            await loader.load(ModuleName.Common)

            expect(registrySpy.define).toHaveBeenCalledWith(CustomEl.is, jasmine.any(Function), undefined)
            expect(registrySpy.define).toHaveBeenCalledTimes(1)
            expect(config.Common.loader).toHaveBeenCalledTimes(1)
        })

        it('should return any sub routes', async () => {
            loader.registerRoot({ providers: [], elements: [] }, containerSpy)
            const module: Module = {
                providers: [],
                elements: [
                    {
                        name: CustomEl.is,
                        element: CustomEl
                    }
                ],
                routes: [
                    {
                        path: 'test',
                        elementName: CustomEl.is
                    }
                ]
            };
            (config.Common.loader as jasmine.Spy).and.returnValue(
                Promise.resolve({ default: module }))

            const routes = await loader.load(ModuleName.Common)

            expect(routes).toEqual(module.routes)
        })

        it('should return undefined if no sub routes', async () => {
            loader.registerRoot({ providers: [], elements: [] }, containerSpy)
            const module: Module = {
                providers: [],
                elements: [
                    {
                        name: CustomEl.is,
                        element: CustomEl
                    }
                ]
            };
            (config.Common.loader as jasmine.Spy).and.returnValue(
                Promise.resolve({ default: module }))

            const routes = await loader.load(ModuleName.Common)

            expect(routes).toBeUndefined()
        })
    })
})

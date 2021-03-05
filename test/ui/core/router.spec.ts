import { ModuleLoader } from '../../../src/ui/core/module-loader'
import { Router } from '../../../src/ui/core/router'
import { Route } from '../../../src/ui/core/route'
import { RouteEvent } from '../../../src/ui/core/route-event'
import { StateTopic, UpdateStateEvent } from '../../../src/services/state'
import { PageWrapper } from '../../../src/ui/core/page-wrapper'
import { ModuleName } from '../../../src/ui/core/module-name'

describe('Router', () => {
    let router: Router
    let pageSpy: jasmine.SpyObj<PageWrapper>
    let moduleLoaderSpy: jasmine.SpyObj<ModuleLoader>
    let eventSpy: jasmine.SpyObj<EventTarget>

    beforeEach(() => {
        pageSpy = jasmine.createSpyObj('PageWrapper', [ 'start', 'register' ])
        moduleLoaderSpy = jasmine.createSpyObj<ModuleLoader>('ModuleLoader', [ 'load' ])
        eventSpy = jasmine.createSpyObj<EventTarget>('EventTarget', [ 'dispatchEvent' ])
        router = new Router(pageSpy, moduleLoaderSpy, eventSpy)
    })

    describe('registerRoutes', () => {
        it('should register each route and start page', () => {
            const routes: Route[] = [
                {
                    elementName: 'el-1',
                    path: '/'
                },
                {
                    elementName: 'el-2',
                    path: '*'
                }
            ]

            router.registerRoutes(routes)

            routes.forEach(({ path }) => {
                expect(pageSpy.register).toHaveBeenCalledWith(path, jasmine.any(Function))
            })
            expect(pageSpy.start).toHaveBeenCalled()
        })

        it('should register routes with callback that dispatches RouteEvent', () => {
            const route: Route = {
                elementName: 'test-el',
                path: '*'
            }

            router.registerRoutes([ route ])
            const callback = pageSpy.register.calls.mostRecent().args[1]
            callback({} as PageJS.Context, jasmine.createSpy())

            expect(eventSpy.dispatchEvent).toHaveBeenCalledWith(new RouteEvent({ elementName: route.elementName }))
        })

        it('should register routes with callback that dispatches UpdateStateEvent with params', () => {
            const expectedParams = {
                id: 1,
                prop: 'abc'
            }
            const route: Route = {
                elementName: 'test-el',
                path: '*'
            }

            router.registerRoutes([ route ])
            const callback = pageSpy.register.calls.mostRecent().args[1]
            callback({ params: expectedParams } as PageJS.Context, jasmine.createSpy())

            expect(eventSpy.dispatchEvent).toHaveBeenCalledWith(
                new UpdateStateEvent(StateTopic.RouteParams, { params: expectedParams }))
        })

        it('should load module if provided', async () => {
            const route: Route = {
                elementName: 'test-el',
                path: '*',
                moduleName: ModuleName.Common
            }

            router.registerRoutes([ route ])
            const callback = pageSpy.register.calls.mostRecent().args[1]
            await callback({} as PageJS.Context, jasmine.createSpy())

            expect(moduleLoaderSpy.load).toHaveBeenCalledWith(ModuleName.Common)
        })

        describe('subRoutes', () => {
            const route: Route = {
                    elementName: 'root-el',
                    path: 'a/*',
                    moduleName: ModuleName.Common
                }
            const subRoutes: Route[] = [
                {
                    elementName: 'b-sub-el',
                    path: 'b'
                },
                {
                    elementName: 'c-sub-el',
                    path: 'c'
                }
            ]
            let callback: PageJS.Callback

            beforeEach(() => {
                moduleLoaderSpy.load.and.returnValue(Promise.resolve(subRoutes))
                router.registerRoutes([ route ])
                callback = pageSpy.register.calls.mostRecent().args[1]
            })

            it('should dispatch routing events to root element and then subRoute element', async () => {
                const subRoutePath = 'b'
                await callback({ params: { [0]: subRoutePath } } as PageJS.Context, jasmine.createSpy())

                expect(eventSpy.dispatchEvent).toHaveBeenCalledWith(new RouteEvent({ elementName: route.elementName }))
                expect(eventSpy.dispatchEvent).toHaveBeenCalledWith(new RouteEvent({
                    elementName: subRoutes.find(r => r.path === subRoutePath)?.elementName ?? '',
                    isSubRoute: true,
                    moduleName: route.moduleName
                }))

                const secondSubRoutePath = 'c'
                await callback({ params: { [0]: secondSubRoutePath } } as PageJS.Context, jasmine.createSpy())

                expect(eventSpy.dispatchEvent).toHaveBeenCalledWith(new RouteEvent({ elementName: route.elementName }))
                expect(eventSpy.dispatchEvent).toHaveBeenCalledWith(new RouteEvent({
                    elementName: subRoutes.find(r => r.path === secondSubRoutePath)?.elementName ?? '',
                    isSubRoute: true,
                    moduleName: route.moduleName
                }))
            })
        })
    })
})

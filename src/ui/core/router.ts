import { Inject, Injectable } from 'cewdi'
import { ModuleLoader } from './module-loader'
import { Route } from './route'
import { globalEventTargetToken } from '../../common/global-event-target-token'
import { RouteEvent } from './route-event'
import { StateTopic, UpdateStateEvent } from '../../services/state'
import { PageWrapper } from './page-wrapper'
import { ModuleName } from './module-name'

@Injectable()
export class Router {
    private readonly routesToModules = new Map<ModuleName, Route>()
    private readonly subRoutes = new Map<ModuleName, Route[]>()
    private hasStartedPage = false

    constructor(
        private readonly page: PageWrapper,
        private readonly moduleLoader: ModuleLoader,
        @Inject(globalEventTargetToken) private readonly eventTarget: EventTarget) {
        }

    registerRoutes(routes: Route[]): void {
        routes.forEach(route => {
            if (route.moduleName) { this.routesToModules.set(route.moduleName, route) }
        })
        this.registerAllRoutes(routes)
    }

    navigate(path: string): void {
        this.page.navigate(path)
    }

    private registerAllRoutes(routes: Route[]): void {
        routes.forEach(route => {
            this.page.register(route.path, this.routeCallbackFactory(route))
        })
        if (!this.hasStartedPage) {
            this.hasStartedPage = true
            this.page.start()
        }
    }

    private routeCallbackFactory(route: Route): PageJS.Callback {
        return async ({ params }) => {
            const moduleName = route.moduleName
            let subRoutes: Route[] | undefined
            if (moduleName) {
                subRoutes = await this.loadModule(moduleName)
            }

            if (this.isSubRoute(route.path)) {
                const subRoute = this.findSubRoute(params, subRoutes)
                subRoute && this.onSubRoute(subRoute, moduleName, params)
                return
            }

            this.eventTarget.dispatchEvent(new RouteEvent({
                elementName: route.elementName,
                moduleName: moduleName
            }))

            this.eventTarget.dispatchEvent(new UpdateStateEvent(StateTopic.RouteParams, { params }))
        }
    }

    private onSubRoute(route: Route, parentModuleName?: ModuleName, params?: any) {
        if (!parentModuleName) {
            throw new Error(`Routed to sub-route ${route.path} but no parent module name was given`)
        }
        const parentRoute = this.routesToModules.get(parentModuleName)
        if (!parentRoute) {
            throw new Error(
                `Routed to sub-route ${route.path} but no parent route was registered for module ${parentModuleName}`)
        }

        // If this is a sub-route within module, need to route to top-level element first,
        // then to sub-element.
        this.eventTarget.dispatchEvent(new RouteEvent({
            elementName: parentRoute.elementName,
            moduleName: parentModuleName
        }))
        setTimeout(() => {
            this.eventTarget.dispatchEvent(new RouteEvent({
                elementName: route.elementName,
                isSubRoute: true,
                moduleName: parentModuleName
            }))
        }, 0)

        this.eventTarget.dispatchEvent(new UpdateStateEvent(StateTopic.RouteParams, { params }))
    }

    private async loadModule(moduleName: ModuleName): Promise<Route[] | undefined> {
        const subRoutes = await this.moduleLoader.load(moduleName)

        if (subRoutes && subRoutes.length) {
            this.subRoutes.set(moduleName, subRoutes)
            return subRoutes
        }

        return this.subRoutes.get(moduleName)
    }

    private isSubRoute(path: string): boolean {
        return path.endsWith('/*')
    }

    private findSubRoute(params: any, subRoutes?: Route[]): Route | undefined {
        if (!(params || subRoutes)) { return undefined }
        const endPath = (params[0] as string | undefined)?.toLowerCase()?.trim()
        return subRoutes?.find(({ path }) => endPath && path === endPath)
    }
}

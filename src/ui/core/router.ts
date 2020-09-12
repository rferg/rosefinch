import { Inject, Injectable } from 'cewdi'
import { ModuleLoader } from './module-loader'
import { Route } from './route'
import { globalEventTargetToken } from '../../common/global-event-target-token'
import { RouteEvent } from './route-event'
import { StateTopic, UpdateStateEvent } from '../../services/state'
import { PageWrapper } from './page-wrapper'

@Injectable()
export class Router {

    constructor(
        private readonly page: PageWrapper,
        private readonly moduleLoader: ModuleLoader,
        @Inject(globalEventTargetToken) private readonly eventTarget: EventTarget) {
        }

    registerRoutes(routes: Route[]): void {
        routes.forEach(route => {
            this.page.register(route.path, this.routeCallbackFactory(route))
        })
        this.page.start()
    }

    navigate(path: string): void {
        this.page.navigate(path)
    }

    private routeCallbackFactory({ elementName, moduleName }: Route): PageJS.Callback {
        return async ({ params }) => {
            if (moduleName) { await this.moduleLoader.load(moduleName) }
            this.eventTarget.dispatchEvent(new RouteEvent({ elementName }))
            this.eventTarget.dispatchEvent(new UpdateStateEvent(StateTopic.RouteParams, { params }))
        }
    }
}

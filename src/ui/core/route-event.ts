import { ModuleName } from './module-name'
import { RouteEventOptions } from './route-event-options'
import { routeEventType } from './route-event-type'

export class RouteEvent extends CustomEvent<RouteEventOptions> {
    get elementName(): string {
        return this.detail.elementName
    }

    get moduleName(): ModuleName | undefined {
        return this.detail.moduleName
    }

    get isSubRoute(): boolean {
        return !!this.detail.isSubRoute
    }

    constructor(detail: RouteEventOptions) {
        super(routeEventType, { detail, bubbles: true })
    }
}

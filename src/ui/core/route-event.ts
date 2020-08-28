import { routeEventType } from './route-event-type'

export class RouteEvent extends CustomEvent<{ elementName: string }> {
    get elementName(): string {
        return this.detail.elementName
    }

    constructor(detail: { elementName: string }) {
        super(routeEventType, { detail, bubbles: true })
    }
}

import { BaseElement } from './base-element'
import { Inject, Injectable } from 'cewdi'
import { globalEventTargetToken } from '../../common/global-event-target-token'
import { routeEventType } from './route-event-type'
import { RouteEvent } from './route-event'
import { html, internalProperty } from 'lit-element'

@Injectable()
export class RouterOutletElement extends BaseElement {

    @internalProperty()
    private currentElement?: string

    private readonly routeListener: EventListener

    constructor(@Inject(globalEventTargetToken) private readonly eventTarget: EventTarget) {
        super()

        this.routeListener = this.onRouteChange.bind(this)
        this.eventTarget.addEventListener(routeEventType, this.routeListener)
    }

    disconnectedCallback() {
        this.eventTarget.removeEventListener(routeEventType, this.routeListener)
    }

    render() {
        return this.currentElement ? html`<${this.currentElement}></${this.currentElement}>` : html``
    }

    private onRouteChange(event: Event): void {
        if (this.isRouteEvent(event)) {
            const { elementName } = event
            if (elementName !== this.currentElement) {
                this.currentElement = elementName
            }
        }
    }

    private isRouteEvent(event: Event): event is RouteEvent {
        return !!(event as RouteEvent)?.elementName
    }
}

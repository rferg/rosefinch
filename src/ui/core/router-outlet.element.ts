import { Inject, Injectable } from 'cewdi'
import { globalEventTargetToken } from '../../common/global-event-target-token'
import { routeEventType } from './route-event-type'
import { RouteEvent } from './route-event'
import { StateMediatorService, StateTopic } from '../../services/state'

@Injectable()
export class RouterOutletElement extends HTMLElement {

    private readonly routeListener: EventListener
    private currentElementName?: string
    private currentElement?: HTMLElement

    constructor(
        private readonly state: StateMediatorService,
        @Inject(globalEventTargetToken) private readonly eventTarget: EventTarget) {
        super()

        this.routeListener = this.onRouteChange.bind(this)
        this.eventTarget.addEventListener(routeEventType, this.routeListener)
        // Ensure that StateMediatorService is created with RouteParams topic.
        this.state.subscribe(StateTopic.RouteParams, () => {})
    }

    disconnectedCallback() {
        this.eventTarget.removeEventListener(routeEventType, this.routeListener)
    }

    private onRouteChange(event: Event): void {
        if (this.isRouteEvent(event)) {
            const { elementName } = event
            if (elementName !== this.currentElementName) {
                if (this.currentElement) {
                    this.removeChild(this.currentElement)
                }
                this.currentElement = document.createElement(elementName)
                this.appendChild(this.currentElement)
                this.currentElementName = elementName
            }
        }
    }

    private isRouteEvent(event: Event): event is RouteEvent {
        return !!(event as RouteEvent)?.elementName
    }
}

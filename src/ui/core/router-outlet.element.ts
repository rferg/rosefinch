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
    private get moduleName(): string | null {
        return this.getAttribute('moduleName')
    }

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
        if (!this.isRouteEvent(event)) { return }

        if (this.canHandleEvent(event)) {
            this.replaceElement(event.elementName)
        } else if (this.shouldRemoveSubRouteElement(event)) {
            this.replaceElement(undefined)
        }
    }

    private replaceElement(elementName?: string) {
        if (elementName === this.currentElementName) { return }

        if (this.currentElement) {
            this.removeChild(this.currentElement)
            this.currentElement = undefined
        }

        if (elementName) {
            this.currentElement = document.createElement(elementName)
            this.appendChild(this.currentElement)
        }

        this.currentElementName = elementName
    }

    private isRouteEvent(event: Event): event is RouteEvent {
        return !!(event as RouteEvent)?.elementName
    }

    private canHandleEvent({ isSubRoute, moduleName }: RouteEvent): boolean {
        return (!isSubRoute && !this.moduleName)
            || (isSubRoute && this.moduleName === moduleName)
    }

    private shouldRemoveSubRouteElement(event: RouteEvent): boolean {
        return !!(this.moduleName && !event.isSubRoute && this.currentElement)
    }
}

import { RouterOutletElement } from '../../../src/ui/core/router-outlet.element'
import { routeEventType } from '../../../src/ui/core/route-event-type'
import { RouteEvent } from '../../../src/ui/core/route-event'
import { defineCE, fixture } from '@open-wc/testing-helpers'
import { StateMediatorService } from '../../../src/services/state'
import { ModuleName } from '../../../src/ui/core/module-name'

describe('RouterOutletElement', () => {
    let eventSpy: jasmine.SpyObj<EventTarget>
    let tag: string

    beforeAll(() => {
        eventSpy = jasmine.createSpyObj<EventTarget>('EventTarget', [ 'addEventListener', 'removeEventListener' ])
        tag = defineCE(class extends RouterOutletElement {
            constructor() {
                super(jasmine.createSpyObj<StateMediatorService>('StateMediatorService', [ 'subscribe' ]), eventSpy)
            }
        })
    })

    beforeEach(() => {
        eventSpy.addEventListener.calls.reset()
        eventSpy.removeEventListener.calls.reset()
    })

    describe('constructor', () => {
        it('should add event listener for route change', async () => {
            await fixture(`<${tag}></${tag}>`)
            expect(eventSpy.addEventListener).toHaveBeenCalledWith(routeEventType, jasmine.any(Function))
        })
    })

    describe('route change listener', () => {
        let listener: EventListener
        let el: RouterOutletElement

        beforeEach(async () => {
            el = await fixture(`<${tag}></${tag}>`)
            listener = eventSpy.addEventListener.calls.mostRecent().args[1] as EventListener
        })

        it('should change current element', async () => {
            const elementName = 'p'
            listener(new RouteEvent({ elementName }))

            expect(el.querySelector(elementName)).toBeTruthy()
        })

        it('should replace old element with new element', () => {
            const oldElementName = 'p'
            const newElementName = 'h1'
            listener(new RouteEvent({ elementName: oldElementName }))
            listener(new RouteEvent({ elementName: newElementName }))

            expect(el.querySelector(newElementName)).toBeTruthy()
            expect(el.querySelector(oldElementName)).toBeFalsy()
        })

        it('should not replace element if moduleName is undefined and event is sub route', () => {
            const oldElementName = 'p'
            const newElementName = 'h1'
            listener(new RouteEvent({ elementName: oldElementName }))
            listener(new RouteEvent({ elementName: newElementName, isSubRoute: true }))

            expect(el.querySelector(newElementName)).toBeFalsy()
            expect(el.querySelector(oldElementName)).toBeTruthy()
        })

        it('should remove element if moduleName is defined and event is not sub route', () => {
            const moduleName = ModuleName.Common
            el.setAttribute('moduleName', moduleName)
            const oldElementName = 'p'
            const newElementName = 'h1'
            listener(new RouteEvent({ elementName: oldElementName, isSubRoute: true, moduleName }))
            listener(new RouteEvent({ elementName: newElementName }))

            expect(el.querySelector(newElementName)).toBeFalsy()
            expect(el.querySelector(oldElementName)).toBeFalsy()
        })

        it('should not replace element if moduleName is defined and event moduleName does not match', () => {
            const moduleName = ModuleName.Common
            el.setAttribute('moduleName', moduleName)
            const oldElementName = 'p'
            const newElementName = 'h1'
            listener(new RouteEvent({ elementName: oldElementName, isSubRoute: true, moduleName }))
            listener(new RouteEvent({ elementName: newElementName, isSubRoute: true, moduleName: ModuleName.Audio }))

            expect(el.querySelector(newElementName)).toBeFalsy()
            expect(el.querySelector(oldElementName)).toBeTruthy()
        })

        it('should replace element if moduleName is defined and event moduleName matches', () => {
            const moduleName = ModuleName.Common
            el.setAttribute('moduleName', moduleName)
            const oldElementName = 'p'
            const newElementName = 'h1'
            listener(new RouteEvent({ elementName: oldElementName, isSubRoute: true, moduleName }))
            listener(new RouteEvent({ elementName: newElementName, isSubRoute: true, moduleName }))

            expect(el.querySelector(newElementName)).toBeTruthy()
            expect(el.querySelector(oldElementName)).toBeFalsy()
        })
    })

    describe('disconnectedCallback', () => {
        it('should remove route change listener', async () => {
            const el: RouterOutletElement = await fixture(`<${tag}></${tag}>`)
            const listener = eventSpy.addEventListener.calls.mostRecent().args[1]

            el.disconnectedCallback()

            expect(eventSpy.removeEventListener).toHaveBeenCalledWith(routeEventType, listener)
        })
    })
})

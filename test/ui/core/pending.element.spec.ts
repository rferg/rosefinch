import { elementUpdated, fixture } from '@open-wc/testing-helpers'
import { html } from 'lit-element'
import { PendingStateEvent } from '../../../src/ui/common/pending-state-event'
import { PendingElement } from '../../../src/ui/core/pending.element'
import { CustomElementRegistrar } from '../../helpers/custom-element-registrar'

describe('PendingElement', () => {
    const eventSpy: jasmine.SpyObj<EventTarget> = jasmine.createSpyObj(
        'EventTarget',
        [ 'addEventListener', 'removeEventListener' ])
    let el: PendingElement

    beforeAll(() => {
        CustomElementRegistrar.instance.register(
            'rf-pending-test',
            class extends PendingElement {
                constructor() { super(eventSpy) }
            })
    })

    beforeEach(async () => {
        eventSpy.addEventListener.calls.reset()
        eventSpy.removeEventListener.calls.reset()
        el = await fixture(html`<rf-pending-test></rf-pending-test>`)
    })

    describe('constructor', () => {
        it('should add PendingStateEvent listener', () => {
            expect(eventSpy.addEventListener).toHaveBeenCalledWith(PendingStateEvent.is, jasmine.any(Function))
        })
    })

    describe('disconnectedCallback', () => {
        it('should remove PendingStateEvent listener', () => {
            const listener = eventSpy.addEventListener.calls.mostRecent().args[1]

            el.disconnectedCallback()

            expect(eventSpy.removeEventListener).toHaveBeenCalledWith(PendingStateEvent.is, listener)
        })
    })

    describe('PendingStateEvent listener', () => {
        let listener: (ev: Event) => Promise<void>

        beforeEach(() => {
            listener = eventSpy.addEventListener.calls.mostRecent().args[1] as (ev: Event) => Promise<void>
        })

        it('should add pending attribute while event\'s promise is waiting and remove when it resolves', async () => {
            const promise = new Promise(async resolve => {
                await elementUpdated(el)
                expect(el.getAttribute('pending')).not.toBeNull()
                resolve()
            })

            await listener(new PendingStateEvent(promise))

            expect(el.getAttribute('pending')).toBeNull()
            await expectAsync(promise).toBeResolved()
        })

        it(
            'should add pending attribute while event\'s promise is waiting and remove when it even if promise rejects',
            async () => {
                const promise = new Promise(async (_, reject) => {
                    await elementUpdated(el)
                    expect(el.getAttribute('pending')).not.toBeNull()
                    reject()
                })

                await listener(new PendingStateEvent(promise))

                expect(el.getAttribute('pending')).toBeNull()
                await expectAsync(promise).toBeRejected()
        })

        it(
            'should remove pending attribute only when all events\' promises have resolved if received multiple',
            async () => {
                const promise = new Promise(async resolve => {
                    await elementUpdated(el)
                    expect(el.getAttribute('pending')).not.toBeNull()
                    await listener(new PendingStateEvent(new Promise(async resolve => {
                        await elementUpdated(el)
                        expect(el.getAttribute('pending')).not.toBeNull()
                        resolve()
                    })))
                    await elementUpdated(el)
                    expect(el.getAttribute('pending')).not.toBeNull()
                    resolve()
                })

                await listener(new PendingStateEvent(promise))

                expect(el.getAttribute('pending')).toBeNull()
                await expectAsync(promise).toBeResolved()
        })
    })
})

import { fixture, html, oneEvent } from '@open-wc/testing-helpers'
import { cancelEventType } from '../../../src/ui/options/cancel-event-type'
import { FormSubmitEvent } from '../../../src/ui/options/form-submit-event'
import { RunConfirmFormElement } from '../../../src/ui/options/run-confirm-form.element'
import { ButtonElementStub } from '../../helpers/button-element-stub'
import { CustomElementRegistrar } from '../../helpers/custom-element-registrar'
import { IconElementStub } from '../../helpers/icon-element-stub'

describe('RunConfirmFormElement', () => {

    beforeAll(() => {
        CustomElementRegistrar.instance.register('rf-button', ButtonElementStub)
        CustomElementRegistrar.instance.register('rf-icon', IconElementStub)
        CustomElementRegistrar.instance.register('rf-run-confirm-form-test', RunConfirmFormElement)
    })

    it('should render correct text', async () => {
        const el = await fixture(html`<rf-run-confirm-form-test></rf-run-confirm-form-test>`)

        expect(el.shadowRoot?.textContent).toMatch(/Run\s+generations?/)
    })

    it('should render input with correct min and max', async () => {
        const el = await fixture(html`<rf-run-confirm-form-test></rf-run-confirm-form-test>`)

        const input: HTMLInputElement | null = el.shadowRoot?.querySelector('input') ?? null

        if (!input) { throw new Error('missing input') }
        expect(input.type).toEqual('number')
        expect(input.max).toEqual('500')
        expect(input.min).toEqual('1')
    })

    it('should dispatch cancel event on cancel button click', async () => {
        const el = await fixture(html`<rf-run-confirm-form-test></rf-run-confirm-form-test>`)

        const button: ButtonElementStub | null = el.shadowRoot
            ?.querySelector('rf-button[buttonrole="danger"]') ?? null
        if (!button) { throw new Error('missing button') }
        setTimeout(() => {
            button.dispatchEvent(new Event('click'))
        }, 0)

        const ev = await oneEvent(el, cancelEventType)
        expect(ev).toBeTruthy()
    })

    const changeInputAndSubmit = (el: Element, value: number) => {
        const input: HTMLInputElement | null = el.shadowRoot?.querySelector('input') ?? null
        if (!input) { throw new Error('missing input') }
        input.value = value.toString()
        input.dispatchEvent(new InputEvent('input'))
        const button: ButtonElementStub | null = el.shadowRoot
            ?.querySelector('rf-button[buttonrole="success"]') ?? null
        if (!button) { throw new Error('missing button') }
        setTimeout(() => {
            button.dispatchEvent(new Event('click'))
        }, 0)
    }

    it('should dispatch submit event with updated value on confirm button click', async () => {
        const el = await fixture(html`<rf-run-confirm-form-test></rf-run-confirm-form-test>`)
        const expectedNumberOfGenerations = 12
        changeInputAndSubmit(el, expectedNumberOfGenerations)

        const { value: { numberOfGenerations } } =
            (await oneEvent(el, FormSubmitEvent.eventType)) as FormSubmitEvent<{ numberOfGenerations: number }>
        expect(numberOfGenerations).toEqual(expectedNumberOfGenerations)
    })

    it('should change value to 1 if given value < 1', async () => {
        const el = await fixture(html`<rf-run-confirm-form-test></rf-run-confirm-form-test>`)
        changeInputAndSubmit(el, 0)

        const { value: { numberOfGenerations } } =
            (await oneEvent(el, FormSubmitEvent.eventType)) as FormSubmitEvent<{ numberOfGenerations: number }>
        expect(numberOfGenerations).toEqual(1)
    })

    it('should change value to 500 if given value > 500', async () => {
        const el = await fixture(html`<rf-run-confirm-form-test></rf-run-confirm-form-test>`)
        changeInputAndSubmit(el, 501)

        const { value: { numberOfGenerations } } =
            (await oneEvent(el, FormSubmitEvent.eventType)) as FormSubmitEvent<{ numberOfGenerations: number }>
        expect(numberOfGenerations).toEqual(500)
    })

    it('should floor non-integer input', async () => {
        const el = await fixture(html`<rf-run-confirm-form-test></rf-run-confirm-form-test>`)
        changeInputAndSubmit(el, 5.12)

        const { value: { numberOfGenerations } } =
            (await oneEvent(el, FormSubmitEvent.eventType)) as FormSubmitEvent<{ numberOfGenerations: number }>
        expect(numberOfGenerations).toEqual(5)
    })
})

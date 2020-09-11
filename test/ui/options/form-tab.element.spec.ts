import { ButtonElementStub } from '../../helpers/button-element-stub'
import { IconElementStub } from '../../helpers/icon-element-stub'
import { FormTabElement } from '../../../src/ui/options/form-tab.element'
import { elementUpdated, fixture, oneEvent } from '@open-wc/testing-helpers'
import { html } from 'lit-element'
import { Icon } from '../../../src/ui/common/icon'
import { tabBackEventType } from '../../../src/ui/options/tab-back-event-type'
import { FormSubmitEvent } from '../../../src/ui/options/form-submit-event'
import { FormStatusEvent } from '../../../src/ui/options/form-status-event'
import { CustomElementRegistrar } from '../../helpers/custom-element-registrar'

type FormValue = { a: number, b: string }
class TestFormElement extends HTMLElement {
    static get is() { return 'test-form-element' }
    value?: FormValue
}

describe('FormTabElement', () => {
    beforeAll(() => {
        CustomElementRegistrar.instance.register(ButtonElementStub.is, ButtonElementStub)
        CustomElementRegistrar.instance.register(IconElementStub.is, IconElementStub)
        CustomElementRegistrar.instance.register(TestFormElement.is, TestFormElement)
        CustomElementRegistrar.instance.register('rf-form-tab', FormTabElement)
    })

    it('should render form element', async () => {
        const el = await fixture(html`
            <rf-form-tab>
                <test-form-element slot="form"></test-form-element>
            </rf-form-tab>`)

        // TestFormElement is slotted, so will be in light dom.
        expect(el.querySelector('test-form-element')).toBeTruthy()
    })

    it('should render submit button but no back if no configs provided', async () => {
        const el = await fixture(html`
            <rf-form-tab>
                    <test-form-element slot="form"></test-form-element>
            </rf-form-tab>`)

        const submitButton = el.shadowRoot?.querySelector('rf-button') as ButtonElementStub
        expect(submitButton).toBeTruthy()
        expect(submitButton.buttonRole).toEqual('success')

        expect(el.shadowRoot?.querySelectorAll('rf-button').length).toBe(1)
    })

    it('should render back button according to expected config', async () => {
        const config: { icon: Icon, role: 'primary' | 'success' } = { icon: Icon.LeftArrow, role: 'primary' }
        const el = await fixture(html`
            <rf-form-tab .backButton=${config}>
                    <test-form-element slot="form"></test-form-element>
            </rf-form-tab>`)

        const backButton = el.shadowRoot?.querySelector('rf-button') as ButtonElementStub
        expect(backButton).toBeTruthy()
        expect(backButton.buttonRole).toBe(config.role)
    })

    it('should dispatch back event on back button click', async () => {
        const config: { icon: Icon, role: 'primary' | 'success' } = { icon: Icon.LeftArrow, role: 'primary' }
        const el = await fixture(html`
            <rf-form-tab .backButton=${config}>
                    <test-form-element slot="form"></test-form-element>
            </rf-form-tab>`)

        const backButton = el.shadowRoot?.querySelector('rf-button') as ButtonElementStub
        if (!backButton) { throw new Error('back button is missing') }

        setTimeout(() => {
            backButton.dispatchEvent(new Event('click'))
        }, 0)

        const ev = await oneEvent(el, tabBackEventType)
        expect(ev).toBeTruthy()
    })

    it('should dispatch form submit event with form element value on submit button click', async () => {
        const expectedValue: FormValue = { a: 1, b: '' }
        const el = await fixture(html`
            <rf-form-tab>
                    <test-form-element slot="form"></test-form-element>
            </rf-form-tab>`)
        const form = el.querySelector('test-form-element') as TestFormElement
        const submitButton = el.shadowRoot?.querySelector('rf-button') as ButtonElementStub
        form.value = expectedValue

        setTimeout(() => {
            submitButton.dispatchEvent(new Event('click'))
        }, 0)

        const { value } = await oneEvent(el, FormSubmitEvent.eventType) as FormSubmitEvent<FormValue>
        expect(value).toEqual(expectedValue)
    })

    it('should disable submit button according to form status events from form element', async () => {
        const el = await fixture(html`
            <rf-form-tab>
                    <test-form-element slot="form"></test-form-element>
            </rf-form-tab>`)
        const submitButton = el.shadowRoot?.querySelector('rf-button') as ButtonElementStub
        const form = el.querySelector('test-form-element') as TestFormElement
        form.dispatchEvent(new FormStatusEvent({ isValid: false }))
        await elementUpdated(el)
        expect(submitButton.disabled).toBeTrue()

        form.dispatchEvent(new FormStatusEvent({ isValid: true }))
        await elementUpdated(el)
        expect(submitButton.disabled).toBeFalse()
    })
})

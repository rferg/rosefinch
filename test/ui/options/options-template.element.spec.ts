import { elementUpdated, fixture, oneEvent } from '@open-wc/testing-helpers'
import { html } from 'lit-html'
import { FormFieldChangeEvent } from '../../../src/ui/options/form-field-change-event'
import { OptionsTemplateElement } from '../../../src/ui/options/options-template.element'
import { ButtonElementStub } from '../../helpers/button-element-stub'
import { CustomElementRegistrar } from '../../helpers/custom-element-registrar'
import { IconElementStub } from '../../helpers/icon-element-stub'
import { InputElementStub } from '../../helpers/input-element-stub'
import { InsideContainerElementStub } from '../../helpers/inside-container-element-stub'

describe('OptionsTemplateElement', () => {
    let el: OptionsTemplateElement

    beforeAll(() => {
        CustomElementRegistrar.instance.register(ButtonElementStub.is, ButtonElementStub)
        CustomElementRegistrar.instance.register(IconElementStub.is, IconElementStub)
        CustomElementRegistrar.instance.register(InputElementStub.is, InputElementStub)
        CustomElementRegistrar.instance.register(InsideContainerElementStub.is, InsideContainerElementStub)
        CustomElementRegistrar.instance.register('rf-options-template-test', OptionsTemplateElement)
    })

    beforeEach(async () => {
        el = await fixture(html`<rf-options-template-test></rf-options-template-test>`)
    })

    it('should create', () => {
        expect(el).toBeDefined()
    })

    it('should render "save new template" button', () => {
        const button = el.shadowRoot?.querySelector(`${ButtonElementStub.is}[title*="new"]`)

        expect(button).toBeTruthy()
    })

    it('should render "save existing" button and template name if templateId and templateName are truthy', async () => {
        const templateId = 'abc'
        const templateName = 'Test Template'
        el.templateId = templateId
        el.templateName = templateName
        await elementUpdated(el)

        const saveButton = el.shadowRoot?.querySelector(`${ButtonElementStub.is}[title*="Save options"]`)
        expect(saveButton).toBeTruthy()
        const templateNameEl = el.shadowRoot?.querySelector('p') as HTMLParagraphElement
        expect(templateNameEl).toBeTruthy()
        expect(templateNameEl.textContent).toContain(templateName)
    })

    it('should render error message if truthy', async () => {
        const errorMessage = 'test error'
        el.errorMessage = errorMessage
        await elementUpdated(el)

        const errorMessageEl = el.shadowRoot?.querySelector('.error-message') as HTMLParagraphElement
        expect(errorMessageEl).toBeTruthy()
        expect(errorMessageEl.textContent).toContain(errorMessage)
    })

    it('should dispatch save-template event on "save existing" button click', async () => {
        const templateId = 'abc'
        const templateName = 'Test Template'
        el.templateId = templateId
        el.templateName = templateName
        await elementUpdated(el)
        const saveButton = el.shadowRoot?.querySelector(`${ButtonElementStub.is}[title*="Save options"]`)
        if (!saveButton) { throw new Error('missing button') }

        setTimeout(() => saveButton.dispatchEvent(new Event('click')), 0)
        const event = await oneEvent(el, 'save-template')
        expect(event).toBeDefined()
    })

    describe('on save as click', () => {
        beforeEach(async () => {
            const button = el.shadowRoot?.querySelector(`${ButtonElementStub.is}[title*="new"]`)
            if (!button) { throw new Error('button is missing') }
            button.dispatchEvent(new Event('click'))
            await elementUpdated(el)
        })

        it('should render name input', () => {
            const input = el.shadowRoot?.querySelector(`${InputElementStub.is}[name="templateName"]`)

            expect(input).toBeTruthy()
        })

        it('should disable confirm button if input value is empty', async () => {
            const input = el.shadowRoot
                ?.querySelector(`${InputElementStub.is}[name="templateName"]`) as InputElementStub
            input.value = ''
            await elementUpdated(el)

            const button = el.shadowRoot
                ?.querySelector(
                    `#nameInputContainer ${ButtonElementStub.is}[buttonrole="success"]`) as ButtonElementStub
            expect(button.disabled).toBeTrue()
        })

        it('should remove input if cancel button is clicked', async () => {
            const button = el.shadowRoot
                ?.querySelector(
                    `#nameInputContainer ${ButtonElementStub.is}[buttonrole="danger"]`) as ButtonElementStub
            button.dispatchEvent(new Event('click'))
            await elementUpdated(el)

            const input = el.shadowRoot?.querySelector(`${InputElementStub.is}[name="templateName"]`)
            expect(input).toBeFalsy()
        })

        it('should dispatch save-as-template event with entered template name', async () => {
            const expectedName = 'test123'
            const input = el.shadowRoot
                ?.querySelector(`${InputElementStub.is}[name="templateName"]`) as InputElementStub
            input.value = expectedName
            input.dispatchEvent(new FormFieldChangeEvent({
                value: { templateName: expectedName },
                isValid: true
            }))
            const button = el.shadowRoot
                ?.querySelector(
                    `#nameInputContainer ${ButtonElementStub.is}[buttonrole="success"]`) as ButtonElementStub

            setTimeout(() => button.dispatchEvent(new Event('click')), 0)
            const event = await oneEvent(el, 'save-as-template')

            expect(event.detail).toEqual(expectedName)
        })
    })
})

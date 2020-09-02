import { elementUpdated, fixture, html, oneEvent } from '@open-wc/testing-helpers'
import { EditableTextInputElement } from '../../../src/ui/options/editable-text-input.element'
import { FormChangeEvent } from '../../../src/ui/options/form-change-event'
import { FormErrorEvent } from '../../../src/ui/options/form-error-event'

describe('EditableTextInputElement', () => {

    beforeAll(() => {
        window.customElements.define('rf-editable-text-input', EditableTextInputElement)
    })

    it('should render', async () => {
        const el = await fixture(html`<rf-editable-text-input></rf-editable-text-input>`)
        expect(el).toBeTruthy()
    })

    it('should render text value', async () => {
        const val = 'test'
        const el = await fixture(html`<rf-editable-text-input .value=${val}></rf-editable-text-input>`)

        expect(el.shadowRoot?.textContent?.trim()).toEqual(val)
    })

    it('should render number value', async () => {
        const val = 44
        const el = await fixture(
            html`<rf-editable-text-input inputType="number" .value=${val}></rf-editable-text-input>`)

        expect(el.shadowRoot?.textContent?.trim()).toEqual(val.toLocaleString())
    })

    it('should use formatter for text value', async () => {
        const val = 'test'
        const formatter = (value?: string | number) => value?.toString().toUpperCase() ?? ''
        const expected = formatter(val)
        const el = await fixture(
            html`<rf-editable-text-input .formatter=${formatter} .value=${val}></rf-editable-text-input>`)

        expect(el.shadowRoot?.textContent?.trim()).toEqual(expected)
    })

    it('should use formatter for number value', async () => {
        const val = 44
        const formatter = (value?: string | number) => (value?.toString() ?? '') + 'hello'
        const expected = formatter(val)
        const el = await fixture(
            html`
                <rf-editable-text-input inputType="number" .formatter=${formatter} .value=${val}>
                </rf-editable-text-input>
            `)

        expect(el.shadowRoot?.textContent?.trim()).toEqual(expected)
    })

    const checkOnAndOff = async ({
            inputType,
            value,
            action
        }: {
            inputType: 'text' | 'number',
            value: string | number,
            action: 'focus' | 'click'
        }) => {
            const el = await fixture(
                html`<rf-editable-text-input inputType=${inputType} .value=${value}></rf-editable-text-input>`)
            const button = el.shadowRoot?.querySelector('button')
            if (!button) { fail('button is missing') }
            button?.[action]()
            button?.dispatchEvent(new Event(action))
            await elementUpdated(el)

            const input = el.shadowRoot?.querySelector(`input[type="${inputType}"]`) as HTMLInputElement
            expect(input).toBeTruthy()
            expect(input.value).toEqual(value.toString())

            input.blur()
            input.dispatchEvent(new Event('blur'))
            await elementUpdated(el)
            expect(el.shadowRoot?.querySelector(`input[type="${inputType}"]`)).toBeFalsy()
            expect(el.shadowRoot?.querySelector('button')).toBeTruthy()
            expect(el.shadowRoot?.textContent?.trim()).toEqual(value.toString())
        }

    it('should should show text input on button focus and button again on blur', async () => {
        await checkOnAndOff({ inputType: 'text', value: 'test', action: 'focus' })
    })

    it('should should show number input on focus and button again on blur', async () => {
        await checkOnAndOff({ inputType: 'number', value: 4, action: 'focus' })
    })

    it('should should show text input on button click and button again on blur', async () => {
        await checkOnAndOff({ inputType: 'text', value: 'test', action: 'click' })
    })

    it('should should show number input on click and button again on blur', async () => {
        await checkOnAndOff({ inputType: 'number', value: 4, action: 'click' })
    })

    it('should dispatch change event on text input change', async () => {
        const newValue = 'abc'
        const el = await fixture(
            html`<rf-editable-text-input></rf-editable-text-input>`)
        const button = el.shadowRoot?.querySelector('button')
        if (!button) { throw new Error('button is missing') }
        button.click()
        button.dispatchEvent(new Event('click'))
        await elementUpdated(el)
        const input = el.shadowRoot?.querySelector('input')
        if (!input) { throw new Error('input is missing') }
        setTimeout(() => {
            input.value = newValue
            input.dispatchEvent(new Event('change'))
        }, 0)

        const { value } = (await oneEvent(el, FormChangeEvent.eventType) as FormChangeEvent)
        expect(value).toEqual(newValue)
        expect(el.getAttribute('invalid')).toBe('false')
    })

    it('should dispatch change event on number input change', async () => {
        const newValue = 5
        const el = await fixture(
            html`<rf-editable-text-input inputType="number"></rf-editable-text-input>`)
        const button = el.shadowRoot?.querySelector('button')
        if (!button) { throw new Error('button is missing') }
        button.click()
        button.dispatchEvent(new Event('click'))
        await elementUpdated(el)
        const input = el.shadowRoot?.querySelector('input')
        if (!input) { throw new Error('input is missing') }
        setTimeout(() => {
            input.value = newValue.toString()
            input.dispatchEvent(new Event('change'))
        }, 0)

        const { value } = (await oneEvent(el, FormChangeEvent.eventType) as FormChangeEvent)
        expect(value).toEqual(newValue)
        expect(el.getAttribute('invalid')).toBe('false')
    })

    it('should dispatch error event if validator fails on text input', async () => {
        const expectedErrors = [ 'test error' ]
        const validator = (_?: string | number) => ({ isValid: false, errors: expectedErrors })
        const el = await fixture(html`<rf-editable-text-input .validator=${validator}></rf-editable-text-input>`)
        const button = el.shadowRoot?.querySelector('button')
        if (!button) { throw new Error('button is missing') }
        button.click()
        button.dispatchEvent(new Event('click'))
        await elementUpdated(el)
        const input = el.shadowRoot?.querySelector('input')
        if (!input) { throw new Error('input is missing') }
        setTimeout(() => {
            input.value = 'abc'
            input.dispatchEvent(new Event('change'))
        }, 0)

        const { errors } = (await oneEvent(el, FormErrorEvent.eventType) as FormErrorEvent)
        expect(errors).toEqual(expectedErrors)
        expect(el.getAttribute('invalid')).toBe('true')
    })

    it('should dispatch error event if validator fails on number input', async () => {
        const expectedErrors = [ 'test error' ]
        const validator = (_?: string | number) => ({ isValid: false, errors: expectedErrors })
        const el = await fixture(html`<rf-editable-text-input inputType="number" .validator=${validator}></rf-editable-text-input>`)
        const button = el.shadowRoot?.querySelector('button')
        if (!button) { throw new Error('button is missing') }
        button.click()
        button.dispatchEvent(new Event('click'))
        await elementUpdated(el)
        const input = el.shadowRoot?.querySelector('input')
        if (!input) { throw new Error('input is missing') }
        setTimeout(() => {
            input.value = '5'
            input.dispatchEvent(new Event('change'))
        }, 0)

        const { errors } = (await oneEvent(el, FormErrorEvent.eventType) as FormErrorEvent)
        expect(errors).toEqual(expectedErrors)
        expect(el.getAttribute('invalid')).toBe('true')
    })

    it('should show select with options if inputType="select"', async () => {
        const options = [
            { label: 'a', value: 0 },
            { label: 'b', value: 1 }
        ]
        const el = await fixture(
            html`<rf-editable-text-input .options=${options}  inputType="select"></rf-editable-text-input>`)

        expect(el.shadowRoot?.querySelector('select')).toBeTruthy()
        options.forEach(({ label, value }) => {
            const opt = el.shadowRoot?.querySelector(`option[value="${value}"]`)
            expect(opt).toBeTruthy()
            expect(opt?.textContent?.trim()).toEqual(label)
        })
    })

    it('should dispatch change event when option selected', async () => {
        const options = [
            { label: 'a', value: 0 },
            { label: 'b', value: 1 }
        ]
        const selectedIndex = options.length - 1
        const el = await fixture(
            html`<rf-editable-text-input .value=${0} .options=${options}  inputType="select"></rf-editable-text-input>`)
        const select = el.shadowRoot?.querySelector('select') as HTMLSelectElement
        if (!select) { throw new Error('select is missing') }

        setTimeout(() => {
            select.selectedIndex = selectedIndex
            select.dispatchEvent(new Event('change'))
        })

        const { value } = await oneEvent(el, FormChangeEvent.eventType) as FormChangeEvent
        expect(value).toEqual(options[selectedIndex].value)
    })
})

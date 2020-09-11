import { fixture, html, oneEvent } from '@open-wc/testing-helpers'
import { InputElement } from '../../../src/ui/options/input.element'
import { FormFieldChangeEvent } from '../../../src/ui/options/form-field-change-event'
import { CustomElementRegistrar } from '../../helpers/custom-element-registrar'

describe('InputElement', () => {

    beforeAll(() => {
        CustomElementRegistrar.instance.register('rf-input-test', InputElement)
    })

    it('should render', async () => {
        const el = await fixture(html`<rf-input-test></rf-input-test>`)
        expect(el).toBeTruthy()
    })

    it('should set initial text value', async () => {
        const val = 'test'
        const el = await fixture(html`<rf-input-test .value=${val}></rf-input-test>`)

        expect((el.shadowRoot?.querySelector('input') as HTMLInputElement)?.value).toEqual(val)
    })

    it('should set initial number value', async () => {
        const val = 44
        const el = await fixture(
            html`<rf-input-test inputType="number" .value=${val}></rf-input-test>`)

        expect((el.shadowRoot?.querySelector('input') as HTMLInputElement)?.value).toEqual(val.toString())
    })

    const changeInput = async ({
        inputType,
        value,
        name,
        validator = () => ({ isValid: true })
    }: {
        inputType: 'number' | 'text',
        value: number | string,
        name: string,
        validator?: (value?: string | number) => { isValid: boolean, errors?: string[] }
    }): Promise<Element> => {
        const el = await fixture(
            html`<rf-input-test
                .validator=${validator}
                name="${name}"
                inputType="${inputType}"></rf-input-test>`)
        const input = el.shadowRoot?.querySelector('input')
        if (!input) { throw new Error('input is missing') }
        setTimeout(() => {
            input.value = value.toString()
            input.dispatchEvent(new Event('change'))
        }, 0)

        return el
    }

    it('should dispatch change event on text input change', async () => {
        const newValue = 'abc'
        const name = 'test'
        const el = await changeInput({ inputType: 'text', value: newValue, name })

        const { value, isValid } = (await oneEvent(el, FormFieldChangeEvent.eventType) as FormFieldChangeEvent)
        expect(value).toEqual({ [name]: newValue })
        expect(isValid).toBeTrue()
        expect(el.getAttribute('invalid')).toBeNull()
    })

    it('should dispatch change event on number input change', async () => {
        const newValue = 5
        const name = 'test'
        const el = await changeInput({ inputType: 'number', value: newValue, name })

        const { value, isValid } = (await oneEvent(el, FormFieldChangeEvent.eventType) as FormFieldChangeEvent)
        expect(value).toEqual({ [name]: newValue })
        expect(isValid).toBeTrue()
        expect(el.getAttribute('invalid')).toBeNull()
    })

    it('should dispatch change event with error if validator fails on text input', async () => {
        const expectedErrors = [ 'test error' ]
        const validator = (_?: string | number) => ({ isValid: false, errors: expectedErrors })
        const el = await changeInput({ inputType: 'text', value: 'a', name: 't', validator })

        const { errors, isValid } = (await oneEvent(el, FormFieldChangeEvent.eventType) as FormFieldChangeEvent)
        expect(errors).toEqual(expectedErrors)
        expect(isValid).toBeFalse()
        expect(el.getAttribute('invalid')).not.toBeNull()
    })

    it('should dispatch error event if validator fails on number input', async () => {
        const expectedErrors = [ 'test error' ]
        const validator = (_?: string | number) => ({ isValid: false, errors: expectedErrors })
        const el = await changeInput({ inputType: 'number', value: 5, name: 't', validator })

        const { errors, isValid } = (await oneEvent(el, FormFieldChangeEvent.eventType) as FormFieldChangeEvent)
        expect(errors).toEqual(expectedErrors)
        expect(isValid).toBeFalse()
        expect(el.getAttribute('invalid')).not.toBeNull()
    })

    it('should show select with options if inputType="select"', async () => {
        const options = [
            { label: 'a', value: 0 },
            { label: 'b', value: 1 }
        ]
        const el = await fixture(
            html`<rf-input-test .options=${options}  inputType="select"></rf-input-test>`)

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
        const name = 'test'
        const el = await fixture(
            html`<rf-input-test name="${name}" .value=${0} .options=${options}  inputType="select"></rf-input-test>`)
        const select = el.shadowRoot?.querySelector('select') as HTMLSelectElement
        if (!select) { throw new Error('select is missing') }

        setTimeout(() => {
            select.selectedIndex = selectedIndex
            select.dispatchEvent(new Event('change'))
        })

        const { value, isValid } = await oneEvent(el, FormFieldChangeEvent.eventType) as FormFieldChangeEvent
        expect(value).toEqual({ [name]: options[selectedIndex].value })
        expect(isValid).toBeTrue()
    })
})

import { FormElement } from '../../../src/ui/options/form.element'
import { defineCE, fixture, oneEvent } from '@open-wc/testing-helpers'
import { FormFieldChangeEvent } from '../../../src/ui/options/form-field-change-event'
import { FormStatusEvent } from '../../../src/ui/options/form-status-event'

class TestFormElement extends FormElement<{ a: number, b: string}> {
    get formErrors(): { [key: string]: string[] } {
        return this.errors
    }
}

describe('FormElement', () => {
    let tag: string

    beforeAll(() => {
        tag = defineCE(TestFormElement)
    })

    it('should update value from form field change event', async () => {
        const el: TestFormElement = await fixture(`<${tag}></${tag}>`)
        el.value = { a: 0, b: '' }
        el.dispatchEvent(new FormFieldChangeEvent({
            value: { a: 1 },
            isValid: true
        }))

        expect(el.value).toEqual({ a: 1, b: '' })

        el.dispatchEvent(new FormFieldChangeEvent({
            value: { b: 'a' },
            isValid: true
        }))

        expect(el.value).toEqual({ a: 1, b: 'a' })

        el.dispatchEvent(new FormFieldChangeEvent({
            value: { b: 'b' },
            isValid: true
        }))
        expect(el.value).toEqual({ a: 1, b: 'b' })
    })

    it('should emit form status event when validity changes', async () => {
        const el: TestFormElement = await fixture(`<${tag}></${tag}>`)
        el.value = { a: 0, b: '' }

        setTimeout(() => {
            el.dispatchEvent(new FormFieldChangeEvent({
                value: { a: 1 },
                isValid: false
            }))
        }, 0)

        const { isValid: shouldBeFalse } = await oneEvent(el, FormStatusEvent.eventType) as FormStatusEvent
        expect(shouldBeFalse).toBeFalse()

        setTimeout(() => {
            el.dispatchEvent(new FormFieldChangeEvent({
                value: { a: 0 },
                isValid: true
            }))
        }, 0)

        const { isValid: shouldBeTrue } = await oneEvent(el, FormStatusEvent.eventType) as FormStatusEvent
        expect(shouldBeTrue).toBeTrue()
    })

    it('should update errors', async () => {
        const el: TestFormElement = await fixture(`<${tag}></${tag}>`)
        const expectedErrors = [ 'an error' ]
        el.value = { a: 0, b: '' }
        el.dispatchEvent(new FormFieldChangeEvent({
            value: { a: 1 },
            isValid: false,
            errors: expectedErrors
        }))

        expect(el.formErrors).toEqual({ a: expectedErrors })

        el.dispatchEvent(new FormFieldChangeEvent({
            value: { a: 1 },
            isValid: true
        }))

        expect(el.formErrors).toEqual({ a: [] })
    })
})

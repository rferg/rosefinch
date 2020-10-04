import { fixture, html, oneEvent } from '@open-wc/testing-helpers'
import { RangeInputElement } from '../../../src/ui/common/range-input.element'
import { ValueChangeEvent } from '../../../src/ui/common/value-change-event'
import { CustomElementRegistrar } from '../../helpers/custom-element-registrar'

describe('RangeInputElement', () => {
    beforeAll(() => {
        CustomElementRegistrar.instance.register('rf-range-input-test', RangeInputElement)
    })

    it('should render range input with min, max, step, and value', async () => {
        const min = 4
        const max = 10
        const value = 8
        const step = 2

        const el = await fixture(html`
            <rf-range-input-test min="${min}" max="${max}" step="${step}" .value=${value}></rf-range-input-test>`)
        const input = el.shadowRoot?.querySelector('input') as HTMLInputElement
        if (!input) { throw new Error('input missing') }

        expect(input.type).toEqual('range')
        expect(input.min).toEqual(min.toString())
        expect(input.max).toEqual(max.toString())
        expect(input.step).toEqual(step.toString())
        expect(input.value).toEqual(value.toString())
    })

    it('should disable input if disabled is true', async () => {
        const el = await fixture(html`<rf-range-input-test ?disabled=${true}></rf-range-input-test>`)

        const input = el.shadowRoot?.querySelector('input') as HTMLInputElement
        if (!input) { throw new Error('input missing') }

        expect(input.getAttribute('disabled')).not.toBeNull()
    })

    it('should dispatch ValueChangeEvent on input event', async () => {
        const expectedValue = 25
        const el = await fixture(html`<rf-range-input-test></rf-range-input-test>`)

        const input = el.shadowRoot?.querySelector('input') as HTMLInputElement
        if (!input) { throw new Error('input missing') }
        setTimeout(() => {
            input.value = expectedValue.toString()
            input.dispatchEvent(new InputEvent('input'))
        }, 0)

        const valueChangeEvent = (await oneEvent(el, 'value-change')) as ValueChangeEvent<number>
        expect(valueChangeEvent.value).toEqual(expectedValue)
    })
})

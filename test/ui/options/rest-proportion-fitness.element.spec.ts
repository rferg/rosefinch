import { elementUpdated, fixture, html, oneEvent } from '@open-wc/testing-helpers'
import { RestProportionOptions } from '../../../src/genetic-algorithm'
import { ValueChangeEvent } from '../../../src/ui/common/value-change-event'
import { FormSubmitEvent } from '../../../src/ui/options/form-submit-event'
import { RestProportionFitnessElement } from '../../../src/ui/options/rest-proportion-fitness.element'
import { ButtonElementStub } from '../../helpers/button-element-stub'
import { CustomElementRegistrar } from '../../helpers/custom-element-registrar'
import { FitnessFormItemButtonsElementStub } from '../../helpers/fitness-form-item-buttons-element-stub'
import { RangeInputElementStub } from '../../helpers/range-input-element-stub'

describe('RestProportionFitnessElement', () => {
    let el: RestProportionFitnessElement

    beforeAll(() => {
        CustomElementRegistrar.instance.register(RangeInputElementStub.is, RangeInputElementStub)
        CustomElementRegistrar.instance.register(ButtonElementStub.is, ButtonElementStub)
        CustomElementRegistrar.instance
            .register(FitnessFormItemButtonsElementStub.is, FitnessFormItemButtonsElementStub)
        CustomElementRegistrar.instance.register('rf-rest-proportion-fitness-test', RestProportionFitnessElement)
    })

    beforeEach(async () => {
        el = await fixture(html`<rf-rest-proportion-fitness-test></rf-rest-proportion-fitness-test>`)
    })

    it('should create', () => {
        expect(el).toBeDefined()
    })

    describe('on proportion change', () => {
        let options: RestProportionOptions

        const updateProportion = (value: number) => {
            const input = el.shadowRoot?.querySelector('rf-range-input')

            if (!input) { throw new Error('no range input found') }

            input.dispatchEvent(new ValueChangeEvent<number>(value))
        }

        beforeEach(() => {
            options = { targetProportion: 0 }
            el.options = { ...options }
        })

        it('should update options.targetProportion', async () => {
            const value = 0.45
            updateProportion(value)
            await elementUpdated(el)

            expect(el.options?.targetProportion).toEqual(value)
        })

        it('should update range input value and label as %', async () => {
            const value = 0.45
            updateProportion(value)
            await elementUpdated(el)

            const input = el.shadowRoot?.querySelector('rf-range-input') as RangeInputElementStub
            expect(input.value).toEqual(value)
            const label = el.shadowRoot?.querySelector('.input-container span')
            expect(label?.textContent).toContain(`${Math.floor(value * 100)}%`)
        })
    })

    describe('cancel', () => {
        it('should emit cancel event', async () => {
            const buttonsEl = el.shadowRoot?.querySelector(FitnessFormItemButtonsElementStub.is)
            setTimeout(() => buttonsEl?.dispatchEvent(new CustomEvent('cancel')), 0)

            const event = await oneEvent(el, 'cancel')

            expect(event).toBeTruthy()
        })
    })

    describe('submit', () => {
        it('should emit FormSubmitEvent with options on submit', async () => {
            const options: RestProportionOptions = {
                targetProportion: 0.4
            }
            el.options = options
            await elementUpdated(el)
            const buttonsEl = el.shadowRoot?.querySelector(FitnessFormItemButtonsElementStub.is)
            setTimeout(() => buttonsEl?.dispatchEvent(new CustomEvent('submit')), 0)

            const event = (await oneEvent(el, 'form-submit')) as FormSubmitEvent<RestProportionOptions>

            expect(event).toBeTruthy()
            expect(event.value).toEqual(options)
        })
    })
})

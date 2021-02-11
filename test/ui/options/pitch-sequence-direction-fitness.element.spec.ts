import { elementUpdated, fixture, oneEvent } from '@open-wc/testing-helpers'
import { html } from 'lit-element'
import { PitchSequenceDirectionOptions } from '../../../src/genetic-algorithm'
import { PitchSequenceType } from '../../../src/genetic-algorithm/fitness/pitch-sequence-type'
import { ValueChangeEvent } from '../../../src/ui/common/value-change-event'
import { FormSubmitEvent } from '../../../src/ui/options/form-submit-event'
import { PitchSequenceDirectionFitnessElement } from '../../../src/ui/options/fitness/pitch-sequence-direction-fitness.element'
import { CustomElementRegistrar } from '../../helpers/custom-element-registrar'
import { FitnessFormItemButtonsElementStub } from '../../helpers/fitness-form-item-buttons-element-stub'
import { RangeInputElementStub } from '../../helpers/range-input-element-stub'

describe('PitchSequenceDirectionFitnessElement', () => {
    let el: PitchSequenceDirectionFitnessElement

    beforeAll(() => {
        CustomElementRegistrar.instance.register(RangeInputElementStub.is, RangeInputElementStub)
        CustomElementRegistrar.instance
            .register(FitnessFormItemButtonsElementStub.is, FitnessFormItemButtonsElementStub)

        CustomElementRegistrar.instance
            .register('rf-pitch-sequence-direction-fitness-test', PitchSequenceDirectionFitnessElement)
    })

    beforeEach(async () => {
        el = await fixture(html`<rf-pitch-sequence-direction-fitness-test></rf-pitch-sequence-direction-fitness-test>`)
    })

    it('should create', () => {
        expect(el).toBeDefined()
    })

    it('should update options.sequenceLength on sequence length change', async () => {
        el.options = {
            sequenceLength: 0,
            scores: {
                ascending: 0,
                descending: 0,
                stable: 0
            }
        }
        const newValue = 3
        const input = el.shadowRoot?.querySelector(`${RangeInputElementStub.is}[name="sequenceLength"]`)
        if (!input) { throw new Error('could not find sequenceLength input') }

        input.dispatchEvent(new ValueChangeEvent<number>(newValue))
        await elementUpdated(el)

        expect(el.options.sequenceLength).toEqual(newValue)
    })

    it('should update score for correct sequence type on change', async () => {
        el.options = {
            sequenceLength: 0,
            scores: {
                ascending: 0,
                descending: 0,
                stable: 0
            }
        }
        const newValue = 3
        const sequenceType = PitchSequenceType.Descending
        const input = el.shadowRoot?.querySelector(`${RangeInputElementStub.is}[name="${sequenceType}"]`)
        if (!input) { throw new Error(`could not find sequenceType ${sequenceType} input`) }

        input.dispatchEvent(new ValueChangeEvent<number>(newValue))
        await elementUpdated(el)

        expect(el.options.scores[sequenceType]).toEqual(newValue)
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
            const options: PitchSequenceDirectionOptions = {
                sequenceLength: 2,
                scores: { ascending: 1, descending: 1, stable: 2 }
            }
            el.options = options
            await elementUpdated(el)
            const buttonsEl = el.shadowRoot?.querySelector(FitnessFormItemButtonsElementStub.is)
            setTimeout(() => buttonsEl?.dispatchEvent(new CustomEvent('submit')), 0)

            const event = (await oneEvent(el, 'form-submit')) as FormSubmitEvent<PitchSequenceDirectionOptions>

            expect(event).toBeTruthy()
            expect(event.value).toEqual(options)
        })
    })
})

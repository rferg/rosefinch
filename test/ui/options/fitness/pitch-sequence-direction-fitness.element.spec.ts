import { elementUpdated, fixture, oneEvent } from '@open-wc/testing-helpers'
import { html } from 'lit-element'
import { FitnessMethod } from '../../../../src/genetic-algorithm'
import { PitchSequenceDirectionConfig } from '../../../../src/genetic-algorithm/fitness/pitch-sequence-direction-config'
import { PitchSequenceType } from '../../../../src/genetic-algorithm/fitness/pitch-sequence-type'
import { OptionsFormService } from '../../../../src/services'
import { ValueChangeEvent } from '../../../../src/ui/common/value-change-event'
import { PitchSequenceDirectionFitnessElement } from '../../../../src/ui/options/fitness/pitch-sequence-direction-fitness.element'
import { FormSubmitEvent } from '../../../../src/ui/options/form-submit-event'
import { CustomElementRegistrar } from '../../../helpers/custom-element-registrar'
import { RangeInputElementStub } from '../../../helpers/range-input-element-stub'

describe('PitchSequenceDirectionFitnessElement', () => {
    const defaultConfig: PitchSequenceDirectionConfig = {
        method: FitnessMethod.PitchSequenceDirection,
        options: {
            sequenceLength: 1,
            scores: {
                ascending: 1,
                descending: 1,
                stable: 1
            }
        }
    }
    const formServiceSpy = jasmine.createSpyObj<OptionsFormService>(
        'OptionsFormService',
        [ 'get' ]
    )
    let el: PitchSequenceDirectionFitnessElement

    beforeAll(() => {
        CustomElementRegistrar.instance.register(RangeInputElementStub.is, RangeInputElementStub)

        CustomElementRegistrar.instance.register(
            'rf-pitch-sequence-direction-fitness-test',
            class extends PitchSequenceDirectionFitnessElement {
                constructor() { super(formServiceSpy) }
            })
    })

    beforeEach(async () => {
        formServiceSpy.get.calls.reset()

        formServiceSpy.get.and.returnValue(defaultConfig)
        el = await fixture(html`<rf-pitch-sequence-direction-fitness-test></rf-pitch-sequence-direction-fitness-test>`)
    })

    it('should create', () => {
        expect(el).toBeDefined()
    })

    it('should update options.sequenceLength on sequence length change', async () => {
        const newValue = 3
        const input = el.shadowRoot?.querySelector(`${RangeInputElementStub.is}[name="sequenceLength"]`)
        if (!input) { throw new Error('could not find sequenceLength input') }

        input.dispatchEvent(new ValueChangeEvent<number>(newValue))
        await elementUpdated(el)

        expect(el.config.options.sequenceLength).toEqual(newValue)
    })

    it('should dispatch submit event with updated sequence length on sequence length change', async () => {
        const newValue = 3
        const input = el.shadowRoot?.querySelector(`${RangeInputElementStub.is}[name="sequenceLength"]`)
        if (!input) { throw new Error('could not find sequenceLength input') }

        setTimeout(() => input.dispatchEvent(new ValueChangeEvent<number>(newValue)), 0)
        const event = (await oneEvent(
            el,
            FormSubmitEvent.eventType)) as FormSubmitEvent<{ pitchSequence: PitchSequenceDirectionConfig }>

        expect(event.value.pitchSequence.options.sequenceLength).toEqual(newValue)
    })

    it('should update score for correct sequence type on change', async () => {
        const newValue = 3
        const sequenceType = PitchSequenceType.Descending
        const input = el.shadowRoot?.querySelector(`${RangeInputElementStub.is}[name="${sequenceType}"]`)
        if (!input) { throw new Error(`could not find sequenceType ${sequenceType} input`) }

        input.dispatchEvent(new ValueChangeEvent<number>(newValue))
        await elementUpdated(el)

        expect(el.config.options.scores[sequenceType]).toEqual(newValue)
    })

    it('should dispatch submit event with updated score on change', async () => {
        const newValue = 3
        const sequenceType = PitchSequenceType.Descending
        const input = el.shadowRoot?.querySelector(`${RangeInputElementStub.is}[name="${sequenceType}"]`)
        if (!input) { throw new Error(`could not find sequenceType ${sequenceType} input`) }

        setTimeout(() => input.dispatchEvent(new ValueChangeEvent<number>(newValue)), 0)
        const event = (await oneEvent(
            el,
            FormSubmitEvent.eventType)) as FormSubmitEvent<{ pitchSequence: PitchSequenceDirectionConfig }>

        expect(event.value.pitchSequence.options.scores[sequenceType]).toEqual(newValue)
    })
})

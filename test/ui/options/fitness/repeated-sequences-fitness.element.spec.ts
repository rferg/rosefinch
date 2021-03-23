import { elementUpdated, fixture, html, oneEvent } from '@open-wc/testing-helpers'
import { FitnessMethod, RepeatedSequencesConfig, RepeatedSequenceType } from '../../../../src/genetic-algorithm'
import { OptionsFormService } from '../../../../src/services'
import { ValueChangeEvent } from '../../../../src/ui/common/value-change-event'
import { RepeatedSequencesFitnessElement } from '../../../../src/ui/options/fitness/repeated-sequences-fitness.element'
import { FormSubmitEvent } from '../../../../src/ui/options/form-submit-event'
import { CustomElementRegistrar } from '../../../helpers/custom-element-registrar'
import { RangeInputElementStub } from '../../../helpers/range-input-element-stub'

describe('RepeatedSequences', () => {
    let el: RepeatedSequencesFitnessElement
    const formServiceSpy = jasmine.createSpyObj<OptionsFormService>(
        'OptionsFormService',
        [ 'get', 'getMaxRepeatedSequenceLength' ])
    const defaultMinLength = 3
    const defaultConfig: RepeatedSequencesConfig = {
        method: FitnessMethod.RepeatedSequences,
        options: {
            types: [
                { type: RepeatedSequenceType.Pitch, minLength: defaultMinLength }
            ]
        }
    }
    const maxLength = 7

    beforeAll(() => {
        CustomElementRegistrar.instance.register(RangeInputElementStub.is, RangeInputElementStub)
        CustomElementRegistrar.instance.register(
            'rf-repeated-sequences-fitness-test',
            class extends RepeatedSequencesFitnessElement {
                constructor() {
                    super(formServiceSpy)
                }
            }
        )
    })

    beforeEach(async () => {
        formServiceSpy.get.calls.reset()
        formServiceSpy.getMaxRepeatedSequenceLength.calls.reset()

        formServiceSpy.get.and.returnValue(defaultConfig)
        formServiceSpy.getMaxRepeatedSequenceLength.and.returnValue(maxLength)

        el = await fixture(html`<rf-repeated-sequences-fitness-test></rf-repeated-sequences-fitness-test>`)
    })

    it('should create', () => {
        expect(el).toBeDefined()
    })

    it('should set config to value retrieved from OptionsFormService', () => {
        expect(formServiceSpy.get).toHaveBeenCalledWith('repeatedSequences')
        expect(el.config).toEqual(defaultConfig)
    })

    it('should render range input with max length retrieved from OptionsFormService', () => {
        const rangeInput = el.shadowRoot?.querySelector(RangeInputElementStub.is) as RangeInputElementStub
        if (!rangeInput) { throw new Error('missing range input') }

        expect(rangeInput.min).toEqual(2)
        expect(rangeInput.max).toEqual(maxLength)
        expect(rangeInput.step).toEqual(1)
        expect(formServiceSpy.getMaxRepeatedSequenceLength).toHaveBeenCalled()
    })

    it('should render label displaying current pitch type value', () => {
        const label = el.shadowRoot?.querySelector('label') as HTMLLabelElement
        if (!label) { throw new Error('missing label') }

        expect(label.textContent).toContain(` ${defaultMinLength}`)
    })

    describe('on min length change', () => {
        const updateMinLength = async (value: number) => {
            const rangeInput = el.shadowRoot?.querySelector(RangeInputElementStub.is) as RangeInputElementStub
            if (!rangeInput) { throw new Error('missing range input') }
            rangeInput.dispatchEvent(new ValueChangeEvent(value))
            await elementUpdated(el)
        }

        it('should update label', async () => {
            const newValue = 8
            await updateMinLength(newValue)
            const label = el.shadowRoot?.querySelector('label') as HTMLLabelElement
            if (!label) { throw new Error('missing label') }

            expect(label.textContent).toContain(` ${newValue}`)
        })

        it('should dispatch submit event', async () => {
            const newValue = 7
            setTimeout(async () => {
                await updateMinLength(newValue)
            }, 0)

            const event = (await oneEvent(
                el,
                FormSubmitEvent.eventType)) as FormSubmitEvent<{ repeatedSequences: RepeatedSequencesConfig }>
            expect(event.value).toEqual({
                repeatedSequences: {
                    ...defaultConfig,
                    options: {
                        ...defaultConfig.options,
                        types: [
                            {
                                ...defaultConfig.options.types[0],
                                minLength: newValue
                            }
                        ]
                    }
                }
            })
        })
    })
})

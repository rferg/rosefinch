import { elementUpdated, fixture, oneEvent } from '@open-wc/testing-helpers'
import { html } from 'lit-element'
import { FitnessMethod } from '../../../../src/genetic-algorithm'
import { ValueChangeEvent } from '../../../../src/ui/common/value-change-event'
import { RhythmicDispersionFitnessElement } from '../../../../src/ui/options/fitness/rhythmic-dispersion-fitness.element'
import { CustomElementRegistrar } from '../../../helpers/custom-element-registrar'
import { RangeInputElementStub } from '../../../helpers/range-input-element-stub'
import { OptionsFormService } from '../../../../src/services'
import { RhythmicDispersionConfig } from '../../../../src/genetic-algorithm/fitness/rhythmic-dispersion-config'
import { FormSubmitEvent } from '../../../../src/ui/options/form-submit-event'

describe('RhythmicDispersionFitnessElement', () => {
    const defaultConfig: RhythmicDispersionConfig = {
        method: FitnessMethod.RhythmicDispersion,
        options: {
            target: 0
        }
    }
    const formServiceSpy = jasmine.createSpyObj<OptionsFormService>(
        'OptionsFormService',
        [ 'get' ]
    )
    let el: RhythmicDispersionFitnessElement

    beforeAll(() => {
        CustomElementRegistrar.instance.register(RangeInputElementStub.is, RangeInputElementStub)
        CustomElementRegistrar.instance.register(
            'rf-rhythmic-dispersion-fitness-test',
            class extends RhythmicDispersionFitnessElement {
                constructor() { super(formServiceSpy) }
            })
    })

    beforeEach(async () => {
        formServiceSpy.get.calls.mostRecent()

        formServiceSpy.get.and.returnValue(defaultConfig)
        el = await fixture(html`<rf-rhythmic-dispersion-fitness-test></rf-rhythmic-dispersion-fitness-test>`)
    })

    it('should create', () => {
        expect(el).toBeDefined()
    })

    describe('on target change', () => {

        const updateTarget = (value: 0 | 1 | 2) => {
            const input = el.shadowRoot?.querySelector(RangeInputElementStub.is)

            if (!input) { throw new Error('did not find range input') }

            input.dispatchEvent(new ValueChangeEvent<0 | 1 | 2>(value))
        }

        it('should update options.target', async () => {
            const value = 1
            updateTarget(value)
            await elementUpdated(el)

            expect(el.config.options.target).toEqual(value)
        })

        it('should update input value and label', async () => {
            const value = 1
            updateTarget(value)
            await elementUpdated(el)

            const input = el.shadowRoot?.querySelector(RangeInputElementStub.is) as RangeInputElementStub
            expect(input.value).toEqual(value)
            const label = el.shadowRoot?.querySelector('.input-container span')
            expect(label?.textContent).toContain('Balanced')
        })

        it('should dispatch submit event with updated options', async () => {
            const value = 2
            setTimeout(() => updateTarget(value), 0)

            const event = (await oneEvent(
                el,
                FormSubmitEvent.eventType)) as FormSubmitEvent<{ rhythmicDispersion: RhythmicDispersionConfig }>
            expect(event.value.rhythmicDispersion.options.target).toEqual(value)
        })
    })
})

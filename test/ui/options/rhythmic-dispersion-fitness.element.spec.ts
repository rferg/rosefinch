import { elementUpdated, fixture, oneEvent } from '@open-wc/testing-helpers'
import { html } from 'lit-element'
import { RhythmicDispersionOptions } from '../../../src/genetic-algorithm'
import { ValueChangeEvent } from '../../../src/ui/common/value-change-event'
import { FormSubmitEvent } from '../../../src/ui/options/form-submit-event'
import { RhythmicDispersionFitnessElement } from '../../../src/ui/options/fitness/rhythmic-dispersion-fitness.element'
import { CustomElementRegistrar } from '../../helpers/custom-element-registrar'
import { FitnessFormItemButtonsElementStub } from '../../helpers/fitness-form-item-buttons-element-stub'
import { RangeInputElementStub } from '../../helpers/range-input-element-stub'

describe('RhythmicDispersionFitnessElement', () => {
    let el: RhythmicDispersionFitnessElement

    beforeAll(() => {
        CustomElementRegistrar.instance.register(RangeInputElementStub.is, RangeInputElementStub)
        CustomElementRegistrar.instance
            .register(FitnessFormItemButtonsElementStub.is, FitnessFormItemButtonsElementStub)
        CustomElementRegistrar.instance
            .register('rf-rhythmic-dispersion-fitness-test', RhythmicDispersionFitnessElement)
    })

    beforeEach(async () => {
        el = await fixture(html`<rf-rhythmic-dispersion-fitness-test></rf-rhythmic-dispersion-fitness-test>`)
    })

    it('should create', () => {
        expect(el).toBeDefined()
    })

    describe('on target change', () => {
        let options: RhythmicDispersionOptions
        const labels = { 0: 'aaaaa', 1: 'bbbbb', 2: 'cccccc' }

        const updateTarget = (value: 0 | 1 | 2) => {
            const input = el.shadowRoot?.querySelector(RangeInputElementStub.is)

            if (!input) { throw new Error('did not find range input') }

            input.dispatchEvent(new ValueChangeEvent<0 | 1 | 2>(value))
        }

        beforeEach(() => {
            options = { target: 0 }
            el.options = options
            el.labels = { ...labels }
        })

        it('should update options.target', async () => {
            const value = 1
            updateTarget(value)
            await elementUpdated(el)

            expect(el.options?.target).toEqual(value)
        })

        it('should update input value and label', async () => {
            const value = 1
            updateTarget(value)
            await elementUpdated(el)

            const input = el.shadowRoot?.querySelector(RangeInputElementStub.is) as RangeInputElementStub
            expect(input.value).toEqual(value)
            const label = el.shadowRoot?.querySelector('.input-container span')
            expect(label?.textContent).toContain(labels[value])
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
            const options: RhythmicDispersionOptions = {
                target: 1
            }
            el.options = options
            await elementUpdated(el)
            const buttonsEl = el.shadowRoot?.querySelector(FitnessFormItemButtonsElementStub.is)
            setTimeout(() => buttonsEl?.dispatchEvent(new CustomEvent('submit')), 0)

            const event = (await oneEvent(el, 'form-submit')) as FormSubmitEvent<RhythmicDispersionOptions>

            expect(event).toBeTruthy()
            expect(event.value).toEqual(options)
        })
    })
})

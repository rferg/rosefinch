import { SizeForm } from '../../../../src/storage'
import { InsideContainerElementStub } from '../../../helpers/inside-container-element-stub'
import { InputElementStub } from '../../../helpers/input-element-stub'
import { SizeFormElement } from '../../../../src/ui/options/size/size-form.element'
import { elementUpdated, fixture, oneEvent } from '@open-wc/testing-helpers'
import { html } from 'lit-element'
import { GeneUtil } from '../../../../src/common/gene-util'
import { FormFieldChangeEvent } from '../../../../src/ui/options/form-field-change-event'
import { TooltipElementStub } from '../../../helpers/tooltip-element-stub'
import { CustomElementRegistrar } from '../../../helpers/custom-element-registrar'
import { FormSubmitEvent } from '../../../../src/ui/options/form-submit-event'
import { StateMediatorService, StateTopic } from '../../../../src/services/state'

describe('SizeFormElement', () => {
    let el: SizeFormElement
    const stateSpy = jasmine.createSpyObj<StateMediatorService>('StateMediatorService', [ 'subscribe' ])
    interface IndexableSizeForm extends SizeForm {
        [key: string]: number
    }
    const defaultValue: IndexableSizeForm = {
        populationSize: 5000,
        timeSignatureTop: 4,
        timeSignatureBottom: 4,
        octaveMax: 6,
        octaveMin: 3,
        shortestNoteDuration: 8,
        measures: 8
    }

    beforeAll(() => {
        CustomElementRegistrar.instance.register(InsideContainerElementStub.is, InsideContainerElementStub)
        CustomElementRegistrar.instance.register(InputElementStub.is, InputElementStub)
        CustomElementRegistrar.instance.register(TooltipElementStub.is, TooltipElementStub)
        CustomElementRegistrar.instance.register(
            'rf-size-form-test',
            class extends SizeFormElement {
                constructor() { super(stateSpy) }
            })
    })

    beforeEach(async () => {
        stateSpy.subscribe.calls.reset()
        el = await fixture(html`<rf-size-form-test></rf-size-form-test>`)
        const [ topic, listener ] = stateSpy.subscribe.calls.mostRecent().args
        if (topic !== StateTopic.OptionsForm) {
            throw new Error('Incorrect state topic')
        }
        listener({ size: defaultValue } as any)
    })

    it('should render all input fields', async () => {
        for (const key in defaultValue) {
            const input = el.shadowRoot?.querySelector(`${InputElementStub.is}[name="${key}"]`)
            expect(input).toBeTruthy(`input for ${key} not found`)
        }
    })

    it('should assign initial values to all input fields', async () => {
        for (const key in defaultValue) {
            const input = el.shadowRoot?.querySelector(`${InputElementStub.is}[name="${key}"]`) as InputElementStub
            expect(input.value).toEqual(defaultValue[key])
        }
    })

    it('should have correct options for timeSignatureBottom', async () => {
        const expectedOptions = [
            { label: '1', value: 1 },
            { label: '2', value: 2 },
            { label: '4', value: 4 },
            { label: '8', value: 8 },
            { label: '16', value: 16 }
        ]
        const input = el.shadowRoot
            ?.querySelector(`${InputElementStub.is}[name="timeSignatureBottom"]`) as InputElementStub
        expect(input).toBeTruthy()
        expect(input.options).toEqual(expectedOptions)
    })

    it('should have correct options for shortestNoteDuration', async () => {
        const expectedOptions = [
            { label: 'Whole', value: 1 },
            { label: 'Half', value: 2 },
            { label: 'Quarter', value: 4 },
            { label: 'Eighth', value: 8 },
            { label: 'Sixteenth', value: 16 }
        ]
        const input = el.shadowRoot
            ?.querySelector(`${InputElementStub.is}[name="shortestNoteDuration"]`) as InputElementStub
        expect(input).toBeTruthy()
        expect(input.options).toEqual(expectedOptions)
    })

    it('should have correct options for min and max octave', async () => {
        const minInput = el.shadowRoot
            ?.querySelector(`${InputElementStub.is}[name="octaveMin"]`) as InputElementStub
        const maxInput = el.shadowRoot
            ?.querySelector(`${InputElementStub.is}[name="octaveMax"]`) as InputElementStub
        const allOptions = [ ...new Array(GeneUtil.MAX_OCTAVE + 1) ].map((_, i) => {
            const value = i + GeneUtil.MIN_OCTAVE
            return { label: value.toString(), value }
        })

        expect(minInput.options).toEqual(allOptions.filter(({ value }) => value <= defaultValue.octaveMax))
        expect(maxInput.options).toEqual(allOptions.filter(({ value }) => value >= defaultValue.octaveMin))
    })

    it('should assign validator to population size input that restricts range between 100 and 10000', async () => {
        const input = el.shadowRoot
            ?.querySelector(`${InputElementStub.is}[name="populationSize"]`) as InputElementStub

        const validator = input.validator

        expect(validator(99).isValid).toBeFalse()
        expect(validator(100).isValid).toBeTrue()
        expect(validator(10000).isValid).toBeTrue()
        expect(validator(10001).isValid).toBeFalse()
    })

    it('should assign validator to time signature top number that restricts range between 1 and 16', async () => {
        const input = el.shadowRoot
            ?.querySelector(`${InputElementStub.is}[name="timeSignatureTop"]`) as InputElementStub

        const validator = input.validator

        expect(validator(0).isValid).toBeFalse()
        expect(validator(1).isValid).toBeTrue()
        expect(validator(16).isValid).toBeTrue()
        expect(validator(17).isValid).toBeFalse()
    })

    it('should assign validator to measures that restricts range between 1 and 10', async () => {
        const input = el.shadowRoot
            ?.querySelector(`${InputElementStub.is}[name="measures"]`) as InputElementStub

        const validator = input.validator

        expect(validator(0).isValid).toBeFalse()
        expect(validator(1).isValid).toBeTrue()
        expect(validator(10).isValid).toBeTrue()
        expect(validator(11).isValid).toBeFalse()
    })

    it('should display error message', async () => {
        const error = 'test error'
        const input = el.shadowRoot
            ?.querySelector(`${InputElementStub.is}[name="measures"]`) as InputElementStub
        input.dispatchEvent(new FormFieldChangeEvent({
            isValid: false,
            errors: [ error ],
            value: { measures: 11 }
        }))
        await elementUpdated(el)

        expect(el.shadowRoot?.textContent).toContain(error)
    })

    it('should display multiple error messages', async () => {
        const measuresError = 'measures error'
        const measuresInput = el.shadowRoot
            ?.querySelector(`${InputElementStub.is}[name="measures"]`) as InputElementStub
        measuresInput.dispatchEvent(new FormFieldChangeEvent({
            isValid: false,
            errors: [ measuresError ],
            value: { measures: 11 }
        }))
        const populationSizeError = 'population size error'
        const populationSizeInput = el.shadowRoot
            ?.querySelector(`${InputElementStub.is}[name="populationSize"]`) as InputElementStub
        populationSizeInput.dispatchEvent(new FormFieldChangeEvent({
            isValid: false,
            errors: [ populationSizeError ],
            value: { populationSize: -1 }
        }))
        await elementUpdated(el)

        expect(el.shadowRoot?.textContent).toContain(measuresError)
        expect(el.shadowRoot?.textContent).toContain(populationSizeError)
    })

    it('should dispatch submit event with updated value on valid change', async () => {
        const measures = 6
        const input = el.shadowRoot
            ?.querySelector(`${InputElementStub.is}[name="measures"]`) as InputElementStub

        setTimeout(() => {
            input.dispatchEvent(new FormFieldChangeEvent({
                isValid: true,
                value: { measures }
            }))
        }, 0)
        const event = (await oneEvent(
            el,
            FormSubmitEvent.eventType)) as FormSubmitEvent<{ size: SizeForm }>

        expect(event.value.size.measures).toEqual(measures)
    })
})

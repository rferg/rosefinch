import { elementUpdated, fixture, html, oneEvent } from '@open-wc/testing-helpers'
import { FitnessMethod } from '../../../../src/genetic-algorithm'
import { RestProportionConfig } from '../../../../src/genetic-algorithm/fitness/rest-proportion-config'
import { StateMediatorService, StateTopic } from '../../../../src/services/state'
import { ValueChangeEvent } from '../../../../src/ui/common/value-change-event'
import { RestProportionFitnessElement } from '../../../../src/ui/options/fitness/rest-proportion-fitness.element'
import { FormSubmitEvent } from '../../../../src/ui/options/form-submit-event'
import { CustomElementRegistrar } from '../../../helpers/custom-element-registrar'
import { RangeInputElementStub } from '../../../helpers/range-input-element-stub'

describe('RestProportionFitnessElement', () => {
    let el: RestProportionFitnessElement
    const defaultConfig: RestProportionConfig = {
        method: FitnessMethod.RestProportion,
        options: {
            targetProportion: 0
        }
    }
    const stateSpy = jasmine.createSpyObj<StateMediatorService>(
        'StateMediatorService',
        [ 'subscribe' ]
    )
    beforeAll(() => {
        CustomElementRegistrar.instance.register(RangeInputElementStub.is, RangeInputElementStub)
        CustomElementRegistrar.instance.register(
            'rf-rest-proportion-fitness-test',
            class extends RestProportionFitnessElement {
                constructor() { super(stateSpy) }
            })
    })

    beforeEach(async () => {
        stateSpy.subscribe.calls.reset()

        el = await fixture(html`<rf-rest-proportion-fitness-test></rf-rest-proportion-fitness-test>`)
        const [ topic, listener ] = stateSpy.subscribe.calls.mostRecent().args
        if (topic !== StateTopic.OptionsForm) {
            throw new Error('Incorrect state topic')
        }
        listener({ restProportion: defaultConfig } as any)
    })

    it('should create', () => {
        expect(el).toBeDefined()
    })

    describe('on proportion change', () => {

        const updateProportion = (value: number) => {
            const input = el.shadowRoot?.querySelector('rf-range-input')

            if (!input) { throw new Error('no range input found') }

            input.dispatchEvent(new ValueChangeEvent<number>(value))
        }

        it('should update options.targetProportion', async () => {
            const value = 0.45
            updateProportion(value)
            await elementUpdated(el)

            expect(el.config.options.targetProportion).toEqual(value)
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

        it('should dispatch submit event with updated options', async () => {
            const value = 0.25
            setTimeout(() => updateProportion(value), 0)

            const event = (await oneEvent(
                el,
                FormSubmitEvent.eventType)) as FormSubmitEvent<{ restProportion: RestProportionConfig }>
            expect(event.value.restProportion.options.targetProportion).toEqual(value)
        })
    })
})

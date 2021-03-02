import { elementUpdated, fixture } from '@open-wc/testing-helpers'
import { html, property } from 'lit-element'
import { FitnessMethod, SerializedGeneticAlgorithmOptions } from '../../../src/genetic-algorithm'
import { OptionsFormMapperService } from '../../../src/services/options-form-mapper-service'
import { NewPipelineRunParams, StateTopic, UpdateStateEvent } from '../../../src/services/state'
import { Icon } from '../../../src/ui/common/icon'
import { BaseElement } from '../../../src/ui/core/base-element'
import { Router } from '../../../src/ui/core/router'
import { cancelEventType } from '../../../src/ui/options/cancel-event-type'
import { FitnessForm } from '../../../src/ui/options/fitness/fitness-form'
import { FormSubmitEvent } from '../../../src/ui/options/form-submit-event'
import { OptionsElement } from '../../../src/ui/options/options.element'
import { SizeForm } from '../../../src/ui/options/size/size-form'
import { tabBackEventType } from '../../../src/ui/options/tab-back-event-type'
import { ContainerElementStub } from '../../helpers/container-element-stub'
import { CustomElementRegistrar } from '../../helpers/custom-element-registrar'
import { FitnessFormElementStub } from '../../helpers/fitness-form-element-stub'
import { PopupElementStub } from '../../helpers/popup-element-stub'
import { RunConfirmFormElementStub } from '../../helpers/run-confirm-form-element-stub'

class SizeFormElementStub extends BaseElement {
    static get is() { return 'rf-size-form' }

    @property()
    value?: SizeForm
}

class FormTabElementStub extends BaseElement {
    static get is() { return 'rf-form-tab' }

    @property({ attribute: false })
    submitButton: { icon: Icon, role: 'primary' | 'success' } = { icon: Icon.Check, role: 'success' }

    @property({ attribute: false })
    backButton?: { icon: Icon, role: 'primary' | 'success' }
}

describe('OptionsElement', () => {
    const activeTabAttr = 'data-active'
    const defaultOptions = {
        measures: 1,
        timeSignature: [ 1, 1 ],
        shortestNoteDuration: 1
    } as SerializedGeneticAlgorithmOptions
    const mapperSpy = jasmine.createSpyObj<OptionsFormMapperService>(
        'OptionsFormMapperService',
        [ 'mapFitnessForm', 'mapSizeForm' ])
    const routerSpy = jasmine.createSpyObj<Router>('Router', [ 'navigate' ])
    const eventSpy = jasmine.createSpyObj<EventTarget>('EventTarget', [ 'dispatchEvent' ])
    let el: OptionsElement

    beforeAll(() => {
        CustomElementRegistrar.instance.register(ContainerElementStub.is, ContainerElementStub)
        CustomElementRegistrar.instance.register(FitnessFormElementStub.is, FitnessFormElementStub)
        CustomElementRegistrar.instance.register(RunConfirmFormElementStub.is, RunConfirmFormElementStub)
        CustomElementRegistrar.instance.register(PopupElementStub.is, PopupElementStub)
        CustomElementRegistrar.instance.register(FormTabElementStub.is, FormTabElementStub)
        CustomElementRegistrar.instance.register(SizeFormElementStub.is, SizeFormElementStub)
        CustomElementRegistrar.instance.register(
            'rf-options-test',
            class extends OptionsElement { constructor() { super(mapperSpy, routerSpy, eventSpy) } })
    })

    beforeEach(async () => {
        mapperSpy.mapFitnessForm.calls.reset()
        mapperSpy.mapSizeForm.calls.reset()
        routerSpy.navigate.calls.reset()
        eventSpy.dispatchEvent.calls.reset()

        mapperSpy.mapFitnessForm.and.returnValue(defaultOptions)

        el = await fixture(html`<rf-options-test></rf-options-test>`)
    })

    it('should initially show size tab', () => {
        const sizeTab = el.shadowRoot?.getElementById('sizeTab')
        if (!sizeTab) { throw new Error('size tab missing') }

        expect(sizeTab.getAttribute(activeTabAttr)).not.toBeNull()

        const fitnessTab = el.shadowRoot?.getElementById('fitnessTab')
        if (!fitnessTab) { throw new Error('fitness tab missing') }

        expect(fitnessTab.getAttribute(activeTabAttr)).toBeNull()
    })

    it('should switch to fitness tab on size tab submit', async () => {
        const sizeTab = el.shadowRoot?.getElementById('sizeTab')
        if (!sizeTab) { throw new Error('size tab missing') }
        sizeTab.dispatchEvent(new FormSubmitEvent<SizeForm>({ value: {} as SizeForm }))
        await elementUpdated(el)

        const fitnessTab = el.shadowRoot?.getElementById('fitnessTab')
        if (!fitnessTab) { throw new Error('fitness tab missing') }
        expect(fitnessTab.getAttribute(activeTabAttr)).not.toBeNull()
        expect(sizeTab.getAttribute(activeTabAttr)).toBeNull()
    })

    it('should return back to size tab on fitness tab back', async () => {
        const sizeTab = el.shadowRoot?.getElementById('sizeTab')
        if (!sizeTab) { throw new Error('size tab missing') }
        sizeTab.dispatchEvent(new FormSubmitEvent<SizeForm>({ value: {} as SizeForm }))
        await elementUpdated(el)
        const fitnessTab = el.shadowRoot?.getElementById('fitnessTab')
        if (!fitnessTab) { throw new Error('fitness tab missing') }
        fitnessTab.dispatchEvent(new CustomEvent(tabBackEventType))
        await elementUpdated(el)

        expect(sizeTab.getAttribute(activeTabAttr)).not.toBeNull()
        expect(fitnessTab.getAttribute(activeTabAttr)).toBeNull()
    })

    it('should show run confirm form on fitness tab submit', async () => {
        const fitnessTab = el.shadowRoot?.getElementById('fitnessTab')
        if (!fitnessTab) { throw new Error('fitness tab missing') }
        fitnessTab.dispatchEvent(new FormSubmitEvent<FitnessForm>({ value: {} as FitnessForm }))
        await elementUpdated(el)

        const popup = el.shadowRoot?.querySelector(PopupElementStub.is) as PopupElementStub
        expect(popup?.show).toBeTrue()
    })

    it('should close popup on run confirm cancel', async () => {
        const fitnessTab = el.shadowRoot?.getElementById('fitnessTab')
        if (!fitnessTab) { throw new Error('fitness tab missing') }
        fitnessTab.dispatchEvent(new FormSubmitEvent<FitnessForm>({ value: {} as FitnessForm }))
        await elementUpdated(el)
        const popup = el.shadowRoot?.querySelector(PopupElementStub.is) as PopupElementStub
        const runConfirm = el.shadowRoot?.querySelector(RunConfirmFormElementStub.is) as RunConfirmFormElementStub

        runConfirm.dispatchEvent(new CustomEvent(cancelEventType))
        await elementUpdated(el)

        expect(popup.show).toBeFalse()
    })

    describe('on run confirmed', () => {
        let popup: PopupElementStub
        let runConfirm: RunConfirmFormElementStub
        const numberOfGenerations = 5
        const submitEvent = new FormSubmitEvent<{ numberOfGenerations: number }>(
            { value: { numberOfGenerations } })

        beforeEach(() => {
            popup = el.shadowRoot?.querySelector(PopupElementStub.is) as PopupElementStub
            runConfirm = el.shadowRoot?.querySelector(RunConfirmFormElementStub.is) as RunConfirmFormElementStub
        })

        it('should close popup', async () => {
            const fitnessTab = el.shadowRoot?.getElementById('fitnessTab')
            if (!fitnessTab) { throw new Error('fitness tab missing') }
            fitnessTab.dispatchEvent(new FormSubmitEvent<FitnessForm>({ value: {} as FitnessForm }))
            await elementUpdated(el)
            runConfirm.dispatchEvent(submitEvent)
            await elementUpdated(el)

            expect(popup.show).toBeFalse()
        })

        it('should pass updated fitness and size form values to mapper', async () => {
            const sizeForm: SizeForm = {
                populationSize: 1,
                timeSignatureTop: 1,
                timeSignatureBottom: 1,
                octaveMax: 1,
                octaveMin: 1,
                shortestNoteDuration: 1,
                measures: 1
            }
            const fitnessForm = {
                rhythmicDispersion: { weight: 3, method: FitnessMethod.RhythmicDispersion, options: { target: 1 } }
            } as FitnessForm
            const sizeTab = el.shadowRoot?.getElementById('sizeTab')
            if (!sizeTab) { throw new Error('fitness tab missing') }
            sizeTab.dispatchEvent(new FormSubmitEvent<SizeForm>({ value: sizeForm }))
            const fitnessTab = el.shadowRoot?.getElementById('fitnessTab')
            if (!fitnessTab) { throw new Error('fitness tab missing') }
            fitnessTab.dispatchEvent(new FormSubmitEvent<FitnessForm>({ value: fitnessForm }))
            await elementUpdated(el)
            runConfirm.dispatchEvent(submitEvent)
            await elementUpdated(el)

            expect(mapperSpy.mapSizeForm).toHaveBeenCalledWith(sizeForm)
            expect(mapperSpy.mapFitnessForm.calls.mostRecent().args[0].rhythmicDispersion)
                .toEqual(fitnessForm.rhythmicDispersion)
        })

        it('should dispatch update state event for correct run params', async () => {
            const sizeForm: SizeForm = {
                populationSize: 1,
                timeSignatureTop: 1,
                timeSignatureBottom: 1,
                octaveMax: 1,
                octaveMin: 1,
                shortestNoteDuration: 1,
                measures: 1
            }
            const sizeTab = el.shadowRoot?.getElementById('sizeTab')
            if (!sizeTab) { throw new Error('fitness tab missing') }
            sizeTab.dispatchEvent(new FormSubmitEvent<SizeForm>({ value: sizeForm }))
            runConfirm.dispatchEvent(submitEvent)
            await elementUpdated(el)

            const expectedParams = {
                size: sizeForm.populationSize,
                genomeSize: 1,
                options: defaultOptions,
                numberOfGenerations
            }
            expect(eventSpy.dispatchEvent).toHaveBeenCalledWith(
                new UpdateStateEvent(StateTopic.PipelineRunParams, expectedParams))
            expect(
                (eventSpy.dispatchEvent.calls.mostRecent().args[0] as UpdateStateEvent<StateTopic.PipelineRunParams>)
                    .newState)
                .toEqual(expectedParams)
        })

        it('should navigate to "/run"', async () => {
            runConfirm.dispatchEvent(submitEvent)
            await elementUpdated(el)

            expect(routerSpy.navigate).toHaveBeenCalledWith('/run')
        })

        const cases: {
            measures: number,
            timeSignature: [number, 1 | 2 | 4 | 8 | 16 ],
            shortestNoteDuration: 1 | 2 | 4 | 8 | 16,
            expected: number
        }[] = [
            {
                measures: 4,
                timeSignature: [ 4, 4 ],
                shortestNoteDuration: 16,
                expected: 64
            },
            {
                measures: 1,
                timeSignature: [ 7, 8 ],
                shortestNoteDuration: 4,
                expected: 3
            },
            {
                measures: 1,
                timeSignature: [ 7, 8 ],
                shortestNoteDuration: 16,
                expected: 14
            },
            {
                measures: 3,
                timeSignature: [ 7, 8 ],
                shortestNoteDuration: 16,
                expected: 42
            },
            {
                measures: 3,
                timeSignature: [ 6, 8 ],
                shortestNoteDuration: 16,
                expected: 36
            },
            {
                measures: 3,
                timeSignature: [ 3, 4 ],
                shortestNoteDuration: 16,
                expected: 36
            },
            {
                measures: 3,
                timeSignature: [ 4, 2 ],
                shortestNoteDuration: 4,
                expected: 24
            },
            {
                measures: 3,
                timeSignature: [ 4, 4 ],
                shortestNoteDuration: 1,
                expected: 3
            },
            {
                measures: 2,
                timeSignature: [ 5, 4 ],
                shortestNoteDuration: 8,
                expected: 20
            }
        ]

        cases.forEach(c => {
            it('should calculate the correct genome size and pass in run params', () => {
                const mapped = { ...defaultOptions, ...c }
                mapperSpy.mapSizeForm.and.returnValue(mapped)
                mapperSpy.mapFitnessForm.and.returnValue(mapped)
                runConfirm.dispatchEvent(submitEvent)

                const genomeSize = ((eventSpy.dispatchEvent.calls.mostRecent()
                    .args[0] as UpdateStateEvent<StateTopic.PipelineRunParams>)
                    .newState as NewPipelineRunParams)
                    .genomeSize
                expect(genomeSize).toEqual(c.expected)
            })
        })
    })
})

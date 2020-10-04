import { elementUpdated, fixture } from '@open-wc/testing-helpers'
import { html, property } from 'lit-element'
import { SerializedGeneticAlgorithmOptions } from '../../../src/genetic-algorithm'
import { RepresentativeGenesService } from '../../../src/services/pipeline'
import { RepresentativeGenesState, StateMediatorService, StateSubscription, StateTopic, UpdateStateEvent } from '../../../src/services/state'
import {
    GeneticAlgorithmOptionsRepository,
    GeneticAlgorithmOptionsStore,
    GeneticAlgorithmSummaryRepository,
    GeneticAlgorithmSummaryStore
} from '../../../src/storage'
import { BaseElement } from '../../../src/ui/core/base-element'
import { Router } from '../../../src/ui/core/router'
import { cancelEventType } from '../../../src/ui/options/cancel-event-type'
import { FormSubmitEvent } from '../../../src/ui/options/form-submit-event'
import { RepresentativeElement } from '../../../src/ui/representatives/representative.element'
import { RepresentativesElement } from '../../../src/ui/representatives/representatives.element'
import { ContainerElementStub } from '../../helpers/container-element-stub'
import { CustomElementRegistrar } from '../../helpers/custom-element-registrar'
import { PopupElementStub } from '../../helpers/popup-element-stub'
import { RunConfirmFormElementStub } from '../../helpers/run-confirm-form-element-stub'

class RepresentativesHeaderElementStub extends BaseElement {
    static get is() { return 'rf-representatives-header' }

    @property()
    generation?: number
}

class EditRepresentativeElementStub extends BaseElement {
    static get is() { return 'rf-edit-representative' }
    @property()
    genome?: number[]

    @property()
    rating?: number
}

class RepresentativeElementStub extends BaseElement {
    static get is() { return 'rf-representative' }
    @property()
    genome?: number[]

    @property()
    rating = 0
}

class PlaybackOptionsElementStub extends BaseElement {
    static get is() { return 'rf-playback-options' }
}

class RepresentativesFitnessFormElementStub extends BaseElement {
    static get is() { return 'rf-representatives-fitness-form' }

    @property()
    options?: SerializedGeneticAlgorithmOptions
}

describe('RepresentativesElement', () => {
    const stateSpy = jasmine.createSpyObj<StateMediatorService>('StateMediatorService', [ 'subscribe' ])
    const subscriptionSpy = jasmine.createSpyObj<StateSubscription>('StateSubscription', [ 'unsubscribe' ])
    stateSpy.subscribe.and.returnValue(subscriptionSpy)
    const routerSpy = jasmine.createSpyObj<Router>('Router', [ 'navigate' ])
    const genesServiceSpy = jasmine.createSpyObj<RepresentativeGenesService>(
        'RepresentativeGenesService',
        [ 'getGenes' ])
    const optionsRepoSpy = jasmine.createSpyObj<GeneticAlgorithmOptionsRepository>(
        'GeneticAlgorithmOptionsRepository',
        [ 'get' ])
    const summaryRepoSpy = jasmine.createSpyObj<GeneticAlgorithmSummaryRepository>(
        'GeneticAlgorithmSummaryRepository',
        [ 'get' ])
    const eventSpy = jasmine.createSpyObj<EventTarget>(
        'EventTarget',
        [ 'dispatchEvent' ])

    let el: RepresentativeElement

    beforeAll(() => {
        CustomElementRegistrar.instance.register(RepresentativesHeaderElementStub.is, RepresentativesHeaderElementStub)
        CustomElementRegistrar.instance.register(EditRepresentativeElementStub.is, EditRepresentativeElementStub)
        CustomElementRegistrar.instance.register(RepresentativeElementStub.is, RepresentativeElementStub)
        CustomElementRegistrar.instance.register(ContainerElementStub.is, ContainerElementStub)
        CustomElementRegistrar.instance.register(PopupElementStub.is, PopupElementStub)
        CustomElementRegistrar.instance.register(PlaybackOptionsElementStub.is, PlaybackOptionsElementStub)
        CustomElementRegistrar.instance
            .register(RepresentativesFitnessFormElementStub.is, RepresentativesFitnessFormElementStub)
        CustomElementRegistrar.instance.register(RunConfirmFormElementStub.is, RunConfirmFormElementStub)
        CustomElementRegistrar.instance.register('rf-representatives-test', class extends RepresentativesElement {
            constructor() {
                super(stateSpy, routerSpy, genesServiceSpy, optionsRepoSpy, summaryRepoSpy, eventSpy)
            }
        })
    })

    beforeEach(async () => {
        stateSpy.subscribe.calls.reset()
        subscriptionSpy.unsubscribe.calls.reset()
        routerSpy.navigate.calls.reset()
        genesServiceSpy.getGenes.calls.reset()
        optionsRepoSpy.get.calls.reset()
        summaryRepoSpy.get.calls.reset()
        eventSpy.dispatchEvent.calls.reset()

        el = await fixture(html`<rf-representatives-test></rf-representatives-test>`)
    })

    describe('disconnectedCallback', () => {
        beforeEach(async () => {
            // Pass route params so that all subscriptions get created.
            stateSpy.subscribe.calls.mostRecent().args[1]({ params: { id: 'a' } })
        })

        it('should unsubscribe from state', () => {
            el.disconnectedCallback()

            expect(subscriptionSpy.unsubscribe).toHaveBeenCalledTimes(3)
        })
    })

    describe('constructor', () => {
        it('should subscribe to RouteParams state topic', () => {
            expect(stateSpy.subscribe).toHaveBeenCalledWith(
                StateTopic.RouteParams,
                jasmine.any(Function)
            )
        })

        describe('route params subscription', () => {
            let routeParamsHandler: (state: { params: { [key: string]: any }}) => any
            const geneticAlgorithmId = 'abc'

            beforeEach(() => {
                routeParamsHandler = stateSpy.subscribe.calls.mostRecent().args[1]
                routeParamsHandler({ params: { id: geneticAlgorithmId } })
            })

            it('should subscribe to RepresentativeGenes and GeneticAlgorithmOptions state topics', () => {
                expect(stateSpy.subscribe).toHaveBeenCalledWith(
                    StateTopic.RepresentativeGenes,
                    jasmine.any(Function),
                    jasmine.anything()
                )

                expect(stateSpy.subscribe).toHaveBeenCalledWith(
                    StateTopic.GeneticAlgorithmOptions,
                    jasmine.any(Function),
                    jasmine.anything()
                )
            })

            describe('representative genes subscription', () => {
                let genesHandler: (state: RepresentativeGenesState) => any
                let onNotImmediatelyAvailable: () => Promise<void>

                beforeEach(() => {
                    const args = stateSpy.subscribe.calls.all()
                        .find(call => call.args[0] === StateTopic.RepresentativeGenes)
                        ?.args ?? []
                    genesHandler = args[1] as (state: { representativeGenes: (number[] | undefined)[] }) => any
                    onNotImmediatelyAvailable = args[2]?.onNotImmediatelyAvailable || (() => {})
                })

                it('should render rf-representative elements with defined genes and undefined ratings', async () => {
                    const genomes = [ [ 0 ], [ 1 ], undefined, [ 2 ] ]
                    const definedGenomes = genomes.filter(g => !!g)

                    genesHandler({ representativeGenes: genomes, generation: 1 })
                    await elementUpdated(el)

                    const repEls = [ ...(el.shadowRoot?.querySelectorAll('rf-representative') ?? []) ]
                    expect(repEls.length).toEqual(definedGenomes.length)
                    definedGenomes.forEach((genome, i) => {
                        const repEl = repEls[i] as RepresentativeElementStub

                        expect(repEl.genome).toEqual(genome)
                        expect(repEl.rating).toBeUndefined()
                    })
                })

                it('should render rf-representatives-header element with generation number', async () => {
                    const expectedGeneration = 1

                    genesHandler({ representativeGenes: [], generation: expectedGeneration })
                    await elementUpdated(el)

                    expect((el.shadowRoot
                        ?.querySelector('rf-representatives-header') as RepresentativesHeaderElementStub).generation)
                        .toEqual(expectedGeneration)
                })

                it('should select first genome as active', async () => {
                    const genomes = [ [ 0 ], [ 1 ], undefined, [ 2 ] ]

                    genesHandler({ representativeGenes: genomes, generation: 1 })
                    await elementUpdated(el)

                    const editRepEl = el.shadowRoot
                        ?.querySelector('rf-edit-representative') as EditRepresentativeElementStub
                    if (!editRepEl) { throw new Error('rf-edit-representative missing') }

                    expect(editRepEl.genome).toEqual(genomes[0])
                })

                it('should have onNotImmediatelyAvailable that calls RepresentativeGenesService', async () => {
                    genesServiceSpy.getGenes.and.returnValue(Promise.resolve([]))
                    await onNotImmediatelyAvailable()

                    expect(genesServiceSpy.getGenes).toHaveBeenCalledWith(geneticAlgorithmId)
                })

                it('should have onNotImmediatelyAvailable that calls GeneticAlgorithmSummaryRepository', async () => {
                    summaryRepoSpy.get.and.returnValue(Promise.resolve({} as GeneticAlgorithmSummaryStore))
                    await onNotImmediatelyAvailable()

                    expect(summaryRepoSpy.get).toHaveBeenCalledWith(geneticAlgorithmId)
                })

                it('should have onNotImmediatelyAvailable that dispatches update state event', async () => {
                    const genes = [ [ 0 ] ]
                    const generation = 1
                    genesServiceSpy.getGenes.and.returnValue(Promise.resolve(genes))
                    summaryRepoSpy.get.and.returnValue(Promise.resolve({ generation } as GeneticAlgorithmSummaryStore))

                    await onNotImmediatelyAvailable()

                    expect(eventSpy.dispatchEvent).toHaveBeenCalledWith(new UpdateStateEvent(
                        StateTopic.RepresentativeGenes,
                        { representativeGenes: genes, generation }
                    ))
                })
            })

            describe('options subscription', () => {
                let onNotImmediatelyAvailable: () => Promise<void>
                const options = {
                    storeName: 'geneticAlgorithmOptions',
                    shortestNoteDuration: 1
                } as GeneticAlgorithmOptionsStore

                beforeEach(() => {
                    const args = stateSpy.subscribe.calls.all()
                        .find(call => call.args[0] === StateTopic.GeneticAlgorithmOptions)
                        ?.args ?? []
                    onNotImmediatelyAvailable = args[2]?.onNotImmediatelyAvailable || (() => {})
                })

                it('should have onNotImmediatelyAvailable that calls GeneticAlgorithmOptionsRepository', async () => {
                    optionsRepoSpy.get.and.returnValue(Promise.resolve(options))

                    await onNotImmediatelyAvailable()

                    expect(optionsRepoSpy.get).toHaveBeenCalledWith(geneticAlgorithmId)
                })

                it('should have onNotImmediatelyAvailable that dispatches update state event', async () => {
                    optionsRepoSpy.get.and.returnValue(Promise.resolve(options))

                    await onNotImmediatelyAvailable()

                    expect(eventSpy.dispatchEvent).toHaveBeenCalledWith(new UpdateStateEvent(
                        StateTopic.GeneticAlgorithmOptions,
                        options
                    ))
                })
            })
        })
    })

    describe('on RepresentativeHeaderElement show-popup event', () => {
        let headerEl: RepresentativesHeaderElementStub

        const emitEvent = (type: string) => {
            headerEl.dispatchEvent(new CustomEvent<string>('show-popup', { detail: type }))
        }

        const getPopup = (): PopupElementStub => {
            const popup = el.shadowRoot?.querySelector('rf-popup') as PopupElementStub
            if (!popup) { throw new Error('missing rf-popup') }
            return popup
        }

        beforeEach(() => {
            const head = el.shadowRoot?.querySelector('rf-representatives-header') as RepresentativesHeaderElementStub
            if (!head) { throw new Error('missing rf-representatives-header') }
            headerEl = head
        })

        it('should display fitness form if emit event with "fitness"', async () => {
            emitEvent('fitness')
            await elementUpdated(el)

            const popupEl = getPopup()
            expect(popupEl.show).toBeTrue()
            expect(popupEl.querySelector('rf-representatives-fitness-form')).toBeDefined()
        })

        it('should display playback options if emit event with "playback"', async () => {
            emitEvent('playback')
            await elementUpdated(el)

            const popupEl = getPopup()
            expect(popupEl.show).toBeTrue()
            expect(popupEl.querySelector('rf-playback-options')).toBeDefined()
        })

        it('should display run confirm form if emit event with "run"', async () => {
            emitEvent('playback')
            await elementUpdated(el)

            const popupEl = getPopup()
            expect(popupEl.show).toBeTrue()
            expect(popupEl.querySelector('rf-run-confirm-form')).toBeDefined()
        })

        it('should close popup on run cancel', async () => {
            emitEvent('run')
            await elementUpdated(el)

            const popupEl = getPopup()
            const runConfirm = popupEl.querySelector('rf-run-confirm-form') as RunConfirmFormElementStub
            runConfirm.dispatchEvent(new CustomEvent(cancelEventType))
            await elementUpdated(el)

            expect(popupEl.show).toBeFalse()
        })

        it('should not display popup if emit event with ""', async () => {
            emitEvent('')
            await elementUpdated(el)

            const popupEl = getPopup()
            expect(popupEl.show).toBeFalse()
        })

        it('should not display popup if emit event with invalid value', async () => {
            emitEvent('xyz')
            await elementUpdated(el)
            await elementUpdated(el)

            const popupEl = getPopup()
            expect(popupEl.show).toBeFalse()
        })
    })

    const initiateWithGenomes = (genomes: (number[] | undefined)[], id = 'abc') => {
        const routeParamsHandler = stateSpy.subscribe.calls.mostRecent().args[1]
        routeParamsHandler({ params: { id } })
        const genesHandler = stateSpy.subscribe.calls.all()
            .find(call => call.args[0] === StateTopic.RepresentativeGenes)
            ?.args[1]
        if (!genesHandler) { throw new Error('missing genes handler') }
        genesHandler({ representativeGenes: genomes, generation: 1 })
    }

    describe('on EditRepresentativeElement rating-change event', () => {
        it('should update rating of active genome', async () => {
            const genomes = [ [ 0 ] ]
            const expectedRating = 1
            initiateWithGenomes(genomes)

            const editRepEl = el.shadowRoot
                ?.querySelector('rf-edit-representative') as EditRepresentativeElementStub
            editRepEl.dispatchEvent(new CustomEvent<number>('rating-change', { detail: expectedRating }))
            await elementUpdated(el)

            const repEl = el.shadowRoot?.querySelector('rf-representative') as RepresentativeElementStub
            expect(repEl.rating).toEqual(expectedRating)
            expect(editRepEl.rating).toEqual(expectedRating)
        })
    })

    describe('on RepresentativeElement click event', () => {
        it('should change currently editing representative', async () => {
            const genomes = [ [ 0 ], [ 1 ] ]
            const newIndex = 1
            initiateWithGenomes(genomes)
            await elementUpdated(el)

            const newActiveRepSelector = `rf-representative[index="${newIndex}"]`
            const newActiveRepEl = el.shadowRoot?.querySelector(newActiveRepSelector)
            if (!newActiveRepEl) { throw new Error(`missing ${newActiveRepSelector}`) }
            newActiveRepEl?.dispatchEvent(new Event('click'))
            await elementUpdated(el)

            const editRepEl = el.shadowRoot
                ?.querySelector('rf-edit-representative') as EditRepresentativeElementStub
            if (!editRepEl) { throw new Error('missing rf-edit-representative') }
            expect(editRepEl.genome).toEqual(genomes[newIndex])
        })
    })

    describe('on run confirm', () => {

        it('should run pipeline on confirmed run', async () => {
            const geneticAlgorithmId = 'xyz'
            const genes = [ [ 0 ] ]
            const expectedRatings = [ 1 ]
            initiateWithGenomes(genes, geneticAlgorithmId)
            await elementUpdated(el)
            const editRepEl = el.shadowRoot
                ?.querySelector('rf-edit-representative') as EditRepresentativeElementStub
            editRepEl.dispatchEvent(new CustomEvent<number>('rating-change', { detail: expectedRatings[0] }))
            await elementUpdated(el)
            const headerEl = el.shadowRoot
                ?.querySelector('rf-representatives-header') as RepresentativesHeaderElementStub
            if (!headerEl) { throw new Error('missing rf-representatives-header') }
            headerEl.dispatchEvent(new CustomEvent<string>('show-popup', { detail: 'run' }))
            await elementUpdated(el)

            const runConfirm = el.shadowRoot?.querySelector('rf-run-confirm-form')
            if (!runConfirm) { throw new Error('missing rf-run-confirm-form') }
            const numberOfGenerations = 5
            runConfirm.dispatchEvent(new FormSubmitEvent({ value: { numberOfGenerations } }))
            await elementUpdated(el)

            expect(eventSpy.dispatchEvent).toHaveBeenCalledWith(new UpdateStateEvent(
                StateTopic.PipelineRunParams,
                { numberOfGenerations, geneticAlgorithmId, userRepresentativeRatings: expectedRatings }
            ))
            expect(routerSpy.navigate).toHaveBeenCalledWith('/run')
        })
    })
})

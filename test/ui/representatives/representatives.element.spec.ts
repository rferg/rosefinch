import { elementUpdated, fixture } from '@open-wc/testing-helpers'
import { html, property } from 'lit-element'
import { SerializedGeneticAlgorithmOptions } from '../../../src/genetic-algorithm'
import { RepresentativeGenesService } from '../../../src/services/pipeline'
import { Instrument, PlaybackOptions, PlaybackService } from '../../../src/services/playback'
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
import { PopupContent } from '../../../src/ui/representatives/popup-content'
import { RepresentativeElement } from '../../../src/ui/representatives/representative.element'
import { RepresentativesElement } from '../../../src/ui/representatives/representatives.element'
import { ContainerElementStub } from '../../helpers/container-element-stub'
import { CustomElementRegistrar } from '../../helpers/custom-element-registrar'
import { GenomeNotationElementStub } from '../../helpers/genome-notation-element-stub'
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

    @property({ reflect: true, type: Boolean })
    playing = false
}

class RepresentativeElementStub extends BaseElement {
    static get is() { return 'rf-representative' }

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
    const playbackSpy = jasmine.createSpyObj<PlaybackService>('PlaybackService', [ 'setupSequence' ])
    let playSpy: jasmine.Spy
    let pauseSpy: jasmine.Spy

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
        CustomElementRegistrar.instance.register(GenomeNotationElementStub.is, GenomeNotationElementStub)
        CustomElementRegistrar.instance.register('rf-representatives-test', class extends RepresentativesElement {
            constructor() {
                super(stateSpy, routerSpy, genesServiceSpy, optionsRepoSpy, summaryRepoSpy, eventSpy, playbackSpy)
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
        playbackSpy.setupSequence.calls.reset()
        playSpy = jasmine.createSpy('PlaySpy')
        pauseSpy = jasmine.createSpy('PauseSpy')
        playbackSpy.setupSequence.and.returnValue(Promise.resolve({
            play: playSpy,
            pause: pauseSpy
        }))

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
                let ifNotMatchAction: () => Promise<void>
                let ifNotMatchMatcher: (state?: RepresentativeGenesState) => boolean

                beforeEach(() => {
                    const args = stateSpy.subscribe.calls.all()
                        .find(call => call.args[0] === StateTopic.RepresentativeGenes)
                        ?.args ?? []
                    genesHandler = args[1] as (state: { representativeGenes: (number[] | undefined)[] }) => any
                    ifNotMatchMatcher = args[2]?.ifNotMatch?.matcher || (_ => false)
                    ifNotMatchAction = args[2]?.ifNotMatch?.action || (() => {})
                })

                it(
                    'should render rf-representative elements with undefined ratings and ' +
                    'rf-genome-notation in slot with genomes',
                    async () => {
                        const genomes = [ [ 0 ], [ 1 ], undefined, [ 2 ] ]
                        const definedGenomes = genomes.filter(g => !!g)

                        genesHandler({ representativeGenes: genomes, generation: 1, geneticAlgorithmId })
                        await elementUpdated(el)

                        const repEls =
                            [ ...(el.shadowRoot?.querySelectorAll(RepresentativeElementStub.is) ?? []) ]
                        expect(repEls.length).toEqual(definedGenomes.length)
                        definedGenomes.forEach((genome, i) => {
                            const repEl = repEls[i] as RepresentativeElementStub

                            expect(repEl.rating).toBeUndefined()

                            const notationEl = repEl
                                .querySelector(GenomeNotationElementStub.is) as GenomeNotationElementStub
                            expect(notationEl).toBeDefined()
                            expect(notationEl.genome).toEqual(genome)
                        })
                })

                it('should render rf-representatives-header element with generation number', async () => {
                    const expectedGeneration = 1

                    genesHandler({ representativeGenes: [], generation: expectedGeneration, geneticAlgorithmId })
                    await elementUpdated(el)

                    expect((el.shadowRoot
                        ?.querySelector(RepresentativesHeaderElementStub.is) as RepresentativesHeaderElementStub)
                        .generation)
                        .toEqual(expectedGeneration)
                })

                it('should select first genome as active', async () => {
                    const genomes = [ [ 0 ], [ 1 ], undefined, [ 2 ] ]

                    genesHandler({ representativeGenes: genomes, generation: 1, geneticAlgorithmId })
                    await elementUpdated(el)

                    const editRepEl = el.shadowRoot
                        ?.querySelector('rf-edit-representative') as EditRepresentativeElementStub
                    if (!editRepEl) { throw new Error('rf-edit-representative missing') }

                    expect(editRepEl.genome).toEqual(genomes[0])
                })

                it('should have ifNotMatch matcher that returns true iff geneticAlgorithmIds match', () => {
                    expect(ifNotMatchMatcher({ geneticAlgorithmId } as RepresentativeGenesState)).toBeTrue()
                    expect(ifNotMatchMatcher(undefined)).toBeFalse()
                    expect(ifNotMatchMatcher({ geneticAlgorithmId: 'xyz' } as RepresentativeGenesState)).toBeFalse()
                })

                it('should have ifNotMatch action that calls RepresentativeGenesService', async () => {
                    genesServiceSpy.getGenes.and.returnValue(Promise.resolve([]))
                    await ifNotMatchAction()

                    expect(genesServiceSpy.getGenes).toHaveBeenCalledWith(geneticAlgorithmId)
                })

                it('should have ifNotMatch action that calls GeneticAlgorithmSummaryRepository', async () => {
                    summaryRepoSpy.get.and.returnValue(Promise.resolve({} as GeneticAlgorithmSummaryStore))
                    await ifNotMatchAction()

                    expect(summaryRepoSpy.get).toHaveBeenCalledWith(geneticAlgorithmId)
                })

                it('should have ifNotMatch action that dispatches update state event', async () => {
                    const genes = [ [ 0 ] ]
                    const generation = 1
                    genesServiceSpy.getGenes.and.returnValue(Promise.resolve(genes))
                    summaryRepoSpy.get.and.returnValue(Promise.resolve({ generation } as GeneticAlgorithmSummaryStore))

                    await ifNotMatchAction()

                    expect(eventSpy.dispatchEvent).toHaveBeenCalledWith(new UpdateStateEvent(
                        StateTopic.RepresentativeGenes,
                        { representativeGenes: genes, generation, geneticAlgorithmId }
                    ))
                })
            })

            describe('options subscription', () => {
                let ifNotMatchMatcher: (state?: GeneticAlgorithmOptionsStore) => boolean
                let ifNotMatchAction: () => Promise<void>

                const options = {
                    storeName: 'geneticAlgorithmOptions',
                    shortestNoteDuration: 1,
                    id: geneticAlgorithmId
                } as GeneticAlgorithmOptionsStore

                beforeEach(() => {
                    const args = stateSpy.subscribe.calls.all()
                        .find(call => call.args[0] === StateTopic.GeneticAlgorithmOptions)
                        ?.args ?? []
                    ifNotMatchAction = args[2]?.ifNotMatch?.action || (() => {})
                    ifNotMatchMatcher = args[2]?.ifNotMatch?.matcher || (_ => false)
                })

                it('should have ifNotMatch matcher that returns true iff geneticAlgorithmIds match', () => {
                    expect(ifNotMatchMatcher(options)).toBeTrue()
                    expect(ifNotMatchMatcher(undefined)).toBeFalse()
                    expect(ifNotMatchMatcher({ ...options, id: 'xyz' })).toBeFalse()
                })

                it('should have ifNotMatch action that calls GeneticAlgorithmOptionsRepository', async () => {
                    optionsRepoSpy.get.and.returnValue(Promise.resolve(options))

                    await ifNotMatchAction()

                    expect(optionsRepoSpy.get).toHaveBeenCalledWith(geneticAlgorithmId)
                })

                it('should have ifNotMatch action that dispatches update state event', async () => {
                    optionsRepoSpy.get.and.returnValue(Promise.resolve(options))

                    await ifNotMatchAction()

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
            const head = el.shadowRoot
                ?.querySelector(RepresentativesHeaderElementStub.is) as RepresentativesHeaderElementStub
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
            expect(popupEl.querySelector(PlaybackOptionsElementStub.is)).toBeDefined()
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
        genesHandler({ representativeGenes: genomes, generation: 1, geneticAlgorithmId: id })
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
                ?.querySelector(RepresentativesHeaderElementStub.is) as RepresentativesHeaderElementStub
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

    describe('on play event from EditRepresentativeElement', () => {

        beforeEach(async () => {
            initiateWithGenomes([ [ 1 ] ], 'a')
            await elementUpdated(el)
        })

        it('should setup sequence, get controls and play, if first call', async () => {
            const editRepEl = el.shadowRoot
                ?.querySelector('rf-edit-representative') as EditRepresentativeElementStub
            editRepEl.dispatchEvent(new CustomEvent('play'))
            await elementUpdated(el)

            expect(playbackSpy.setupSequence).toHaveBeenCalled()
            expect(playSpy).toHaveBeenCalled()
        })

        it('should only setup sequence once if called twice with same genome', async () => {
            const editRepEl = el.shadowRoot
                ?.querySelector('rf-edit-representative') as EditRepresentativeElementStub
            editRepEl.dispatchEvent(new CustomEvent('play'))
            await elementUpdated(el)
            editRepEl.dispatchEvent(new CustomEvent('play'))

            expect(playbackSpy.setupSequence).toHaveBeenCalledTimes(1)
            expect(playSpy).toHaveBeenCalledTimes(2)
        })

        it('should pass a note change callback that sets EditRepresentativeElement.playing as !isDone', async () => {
            const editRepEl = el.shadowRoot
                ?.querySelector('rf-edit-representative') as EditRepresentativeElementStub
            editRepEl.dispatchEvent(new CustomEvent('play'))
            await elementUpdated(el)

            const callback = playbackSpy.setupSequence.calls.mostRecent().args[0].callbacks?.onNoteChange
            if (!callback) { throw new Error('on note change callback missing') }

            callback('', 0, false)
            await elementUpdated(el)
            expect(editRepEl.playing).toBeTrue()

            callback('', 0, true)
            await elementUpdated(el)
            expect(editRepEl.playing).toBeFalse()
        })
    })

    describe('on pause event', () => {
        let editRepEl: EditRepresentativeElementStub

        beforeEach(async () => {
            initiateWithGenomes([ [ 1 ] ], 'a')
            await elementUpdated(el)
            editRepEl = el.shadowRoot
                ?.querySelector('rf-edit-representative') as EditRepresentativeElementStub
            editRepEl.dispatchEvent(new CustomEvent('play'))
            await elementUpdated(el)
        })

        it('should call pause on playback controls', async () => {
            editRepEl.dispatchEvent(new CustomEvent('pause'))
            await elementUpdated(el)

            expect(pauseSpy).toHaveBeenCalled()
        })

        it('should update EditRepresentativeElement playing property to false', async () => {
            // Ensure playing has been set to true.
            const callback = playbackSpy.setupSequence.calls.mostRecent().args[0].callbacks?.onNoteChange
            if (!callback) { throw new Error('on note change callback missing') }
            callback('', 0, false)

            editRepEl.dispatchEvent(new CustomEvent('pause'))
            await elementUpdated(el)

            expect(editRepEl.playing).toBeFalse()
        })
    })

    describe('on playback options change event', () => {
        let playbackOptionsEl: PlaybackOptionsElementStub

        beforeEach(async () => {
            initiateWithGenomes([ [ 1 ] ], 'a')
            await elementUpdated(el)
            const headerEl = el.shadowRoot
                ?.querySelector(RepresentativesHeaderElementStub.is) as RepresentativesHeaderElementStub
            headerEl.dispatchEvent(new CustomEvent<PopupContent>('show-popup', { detail: 'playback' }))
            await elementUpdated(el)
            playbackOptionsEl = el.shadowRoot
                ?.querySelector(PlaybackOptionsElementStub.is) as PlaybackOptionsElementStub
        })

        it('should update playback options', async () => {
            const newOptions: PlaybackOptions = {
                bpm: 1,
                instrument: Instrument.Synth,
                loop: true
            }
            playbackOptionsEl.dispatchEvent(new FormSubmitEvent<PlaybackOptions>({ value: newOptions }))
            await elementUpdated(el)

            // Check that options have been updated by playing genome.
            const editRepEl = el.shadowRoot
                ?.querySelector(EditRepresentativeElementStub.is) as EditRepresentativeElementStub
            editRepEl.dispatchEvent(new CustomEvent('play'))
            await elementUpdated(el)
            expect(playbackSpy.setupSequence.calls.mostRecent().args[0].options).toEqual(newOptions)
        })

        it('should close popup', async () => {
            const newOptions: PlaybackOptions = {
                bpm: 1,
                instrument: Instrument.Synth,
                loop: true
            }
            playbackOptionsEl.dispatchEvent(new FormSubmitEvent<PlaybackOptions>({ value: newOptions }))
            await elementUpdated(el)

            expect(el.shadowRoot?.querySelector(PlaybackOptionsElementStub.is)).toBeFalsy()
        })
    })

    describe('playback options cancel event', () => {
        it('should close popup', async () => {
            initiateWithGenomes([ [ 1 ] ], 'a')
            await elementUpdated(el)
            const headerEl = el.shadowRoot
                ?.querySelector(RepresentativesHeaderElementStub.is) as RepresentativesHeaderElementStub
            headerEl.dispatchEvent(new CustomEvent<PopupContent>('show-popup', { detail: 'playback' }))
            await elementUpdated(el)
            const playbackOptionsEl = el.shadowRoot
                ?.querySelector(PlaybackOptionsElementStub.is) as PlaybackOptionsElementStub

            playbackOptionsEl.dispatchEvent(new CustomEvent(cancelEventType))
            await elementUpdated(el)

            expect(el.shadowRoot?.querySelector(PlaybackOptionsElementStub.is)).toBeFalsy()
        })
    })
})

import { RepresentativeGenesState, StateMediatorService, StateTopic, UpdateStateEvent } from '../../../src/services/state'
import { updateStateEventType } from '../../../src/services/state/update-state-event-type'
import { ClusterConfig } from '../../../src/services/pipeline/cluster-config'

describe('StateMediatorService', () => {
    let service: StateMediatorService
    let eventTargetSpy: jasmine.SpyObj<EventTarget>

    beforeEach(() => {
        eventTargetSpy = jasmine.createSpyObj<EventTarget>('EventTarget', [ 'addEventListener' ])
        service = new StateMediatorService(eventTargetSpy)
    })

    describe('constructor', () => {
        it('should add event listener for update events', () => {
            expect(eventTargetSpy.addEventListener)
                .toHaveBeenCalledWith(updateStateEventType, jasmine.any(Function))
        })
    })

    describe('update event listener', () => {
        let listener: EventListener

        beforeEach(() => {
            listener = eventTargetSpy.addEventListener.calls.mostRecent().args[1] as EventListener
        })

        it('should update state and emit to subscribers', () => {
            const topic = StateTopic.RepresentativeGenes
            let state: RepresentativeGenesState | undefined
            service.subscribe(topic, (x) => state = x)
            const expected: RepresentativeGenesState = {
                geneticAlgorithmId: '',
                representativeGenes: [ [ 0 ] ],
                generation: 1
            }

            listener(new UpdateStateEvent(topic, expected))

            expect(state).toEqual(expected)
        })

        it('should stop event propagation is update event', () => {
            const event = new UpdateStateEvent(
                StateTopic.RepresentativeGenes,
                {
                    geneticAlgorithmId: '',
                    representativeGenes: [ [ 0 ] ],
                    generation: 1
                })
            const stopPropSpy = spyOn(event, 'stopPropagation')

            listener(event)

            expect(stopPropSpy).toHaveBeenCalled()
        })

        it('should not stop propagation or update state if not given an update event', () => {
            const event = new Event('click')
            const stopPropSpy = spyOn(event, 'stopPropagation')
            const updateSpy = jasmine.createSpy('update')
            service.subscribe(StateTopic.RepresentativeGenes, updateSpy)

            listener(event)

            expect(stopPropSpy).not.toHaveBeenCalled()
            expect(updateSpy).not.toHaveBeenCalled()
        })
    })

    describe('subscribe', () => {
        let updateListener: EventListener

        beforeEach(() => {
            updateListener = eventTargetSpy.addEventListener.calls.mostRecent().args[1] as EventListener
        })

        it('should emit new state after update for correct topic', () => {
            const ccUpdateSpy = jasmine.createSpy('ClusterConfigUpdate')
            const urUpdateSpy = jasmine.createSpy('UserRatingsUpdateSpy')
            service.subscribe(StateTopic.ClusterConfig, ccUpdateSpy)
            service.subscribe(StateTopic.RepresentativeGenes, urUpdateSpy)
            const ccState: ClusterConfig = { maxIterations: 1, numberOfRepresentatives: 1, stopThreshold: 1 }
            const rgState: RepresentativeGenesState = {
                geneticAlgorithmId: '',
                representativeGenes: [ [ 0 ] ],
                generation: 1
            }

            updateListener(new UpdateStateEvent(StateTopic.RepresentativeGenes, rgState))
            updateListener(new UpdateStateEvent(StateTopic.ClusterConfig, ccState))

            expect(ccUpdateSpy).toHaveBeenCalledWith(ccState)
            expect(urUpdateSpy).toHaveBeenCalledWith(rgState)
        })

        it('should emit current value on subscribe if it exists', () => {
            const updateSpy = jasmine.createSpy('update')
            const state: RepresentativeGenesState = {
                geneticAlgorithmId: '',
                representativeGenes: [ [ 0 ] ],
                generation: 1
            }
            updateListener(new UpdateStateEvent(StateTopic.RepresentativeGenes, state))

            service.subscribe(StateTopic.RepresentativeGenes, updateSpy)

            expect(updateSpy).toHaveBeenCalledWith(state)
        })

        it('should call matcher given ifNotMatch and call action if it returns false', () => {
            const actionSpy = jasmine.createSpy('action')
            const matcherSpy = jasmine.createSpy('matcher').and.returnValue(false)
            const updateSpy = jasmine.createSpy('update')

            service.subscribe(
                StateTopic.RepresentativeGenes,
                updateSpy,
                {
                    ifNotMatch: {
                        matcher: matcherSpy,
                        action: actionSpy
                    }
                })

            expect(matcherSpy).toHaveBeenCalledTimes(1)
            expect(actionSpy).toHaveBeenCalledTimes(1)
        })

        it('should call matcher given ifNotMatch but not call action if it returns true', () => {
            const actionSpy = jasmine.createSpy('action')
            const updateSpy = jasmine.createSpy('update')

            service.subscribe(
                StateTopic.RepresentativeGenes,
                updateSpy,
                {
                    ifNotMatch: {
                        matcher: _ => true,
                        action: actionSpy
                    }
                })

            expect(actionSpy).not.toHaveBeenCalled()
        })

        it('should return unsubscribe function that removes listener', () => {
            const updateSpy = jasmine.createSpy('update')
            const { unsubscribe } = service.subscribe(StateTopic.RepresentativeGenes, updateSpy)

            unsubscribe()

            updateListener(
                new UpdateStateEvent(
                    StateTopic.RepresentativeGenes,
                    { representativeGenes: [ [ 0 ] ], generation: 1, geneticAlgorithmId: '' }))
            expect(updateSpy).not.toHaveBeenCalled()
        })
    })
})

import { StateMediatorService, StateTopic, UpdateStateEvent } from '../../../src/services/state'
import { updateStateEventType } from '../../../src/services/state/update-state-event-type'
import { UserRatingsState } from '../../../src/services/state/user-ratings-state'
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
            const topic = StateTopic.UserRatings
            let state: UserRatingsState | undefined
            service.subscribe(topic, (x) => state = x)
            const expected: UserRatingsState = { userRepresentativeRatings: [ 1, 1, 1 ] }

            listener(new UpdateStateEvent(topic, expected))

            expect(state).toEqual(expected)
        })

        it('should stop event propagation is update event', () => {
            const event = new UpdateStateEvent(StateTopic.UserRatings, { userRepresentativeRatings: [] })
            const stopPropSpy = spyOn(event, 'stopPropagation')

            listener(event)

            expect(stopPropSpy).toHaveBeenCalled()
        })

        it('should not stop propagation or update state if not given an update event', () => {
            const event = new Event('click')
            const stopPropSpy = spyOn(event, 'stopPropagation')
            const updateSpy = jasmine.createSpy('update')
            service.subscribe(StateTopic.UserRatings, updateSpy)

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
            service.subscribe(StateTopic.UserRatings, urUpdateSpy)
            const ccState: ClusterConfig = { maxIterations: 1, numberOfRepresentatives: 1, stopThreshold: 1 }
            const urState: UserRatingsState = { userRepresentativeRatings: [ 1 ] }

            updateListener(new UpdateStateEvent(StateTopic.UserRatings, urState))
            updateListener(new UpdateStateEvent(StateTopic.ClusterConfig, ccState))

            expect(ccUpdateSpy).toHaveBeenCalledWith(ccState)
            expect(urUpdateSpy).toHaveBeenCalledWith(urState)
        })

        it('should emit current value on subscribe if it exists', () => {
            const updateSpy = jasmine.createSpy('update')
            const state: UserRatingsState = { userRepresentativeRatings: [ 1 ] }
            updateListener(new UpdateStateEvent(StateTopic.UserRatings, state))

            service.subscribe(StateTopic.UserRatings, updateSpy)

            expect(updateSpy).toHaveBeenCalledWith(state)
        })

        it('should return unsubscribe function that removes listener', () => {
            const updateSpy = jasmine.createSpy('update')
            const { unsubscribe } = service.subscribe(StateTopic.UserRatings, updateSpy)

            unsubscribe()

            updateListener(new UpdateStateEvent(StateTopic.UserRatings, { userRepresentativeRatings: [] }))
            expect(updateSpy).not.toHaveBeenCalled()
        })
    })
})

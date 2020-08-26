import { StateService } from '../../../src/services/state/state-service'

type TestState = { prop: number }

describe('StateService', () => {
    let service: StateService<TestState>

    beforeEach(() => {
        service = new StateService<TestState>()
    })

    describe('update', () => {
        let listenerSpy: jasmine.Spy

        beforeEach(() => {
            listenerSpy = jasmine.createSpy('listener')
            service.addListener(listenerSpy)
        })

        it('should update state', () => {
            const expected = { prop: 34 }
            const updater = (_?: TestState) => expected

            const result = service.update(updater)

            expect(result).toEqual(expected)
            expect(service.getCurrent()).toEqual(expected)
        })

        it('should call listeners with updated state', () => {
            const expected = { prop: 34 }
            const updater = (_?: TestState) => expected

            service.update(updater)

            expect(listenerSpy).toHaveBeenCalledWith(expected)
        })
    })

    describe('getCurrent', () => {
        it('should return current state as undefined if never set', () => {
            expect(service.getCurrent()).toBeUndefined()
        })

        it('should return copy of updated state', () => {
            const updated = { prop: 2 }
            const updater = (_?: TestState) => updated
            service.update(updater)

            const state = service.getCurrent()

            expect(state).toEqual(updated)
            expect(state).not.toBe(updated)
            if (state) {
                state.prop += 1
                expect(service.getCurrent()).toEqual(updated)
                expect(service.getCurrent()).not.toEqual(state)
            }
        })
    })

    describe('addListener', () => {
        const state = { prop: 2 }
        const updater = (_?: TestState) => state

        it('should add listener', () => {
            const listener = jasmine.createSpy('listener')

            service.addListener(listener)
            service.update(updater)

            expect(listener).toHaveBeenCalledWith(state)
        })

        it('should add multiple listeners', () => {
            const listeners = [ jasmine.createSpy('listener1'), jasmine.createSpy('listener2') ]

            listeners.forEach(listener => service.addListener(listener))
            service.update(updater)

            listeners.forEach(listener => expect(listener).toHaveBeenCalledWith(state))
        })

        it('should only call listener once if added multiple times', () => {
            const listener = jasmine.createSpy('listener')

            service.addListener(listener)
            service.addListener(listener)
            service.update(updater)

            expect(listener).toHaveBeenCalledWith(state)
            expect(listener).toHaveBeenCalledTimes(1)
        })

        it('should not allow listener to mutate state', () => {
            const listener = (x?: TestState) => {
                if (x) { x.prop += 1 }
            }

            service.addListener(listener)
            service.update(updater)

            expect(service.getCurrent()).toEqual(state)
        })

        it('should call all listeners even if one throws and then rethrow error', () => {
            const error = new Error('test error')
            const listenerThatThrows = (_?: TestState) => { throw error }
            const listener = jasmine.createSpy('listener')

            service.addListener(listenerThatThrows)
            service.addListener(listener)

            try {
                service.update(updater)
            } catch (err) {
                expect(err).toEqual(error)
            } finally {
                expect(listener).toHaveBeenCalledWith(state)
            }
        })
    })

    describe('removeListener', () => {
        const state = { prop: 2 }
        const updater = (_?: TestState) => state

        it('should remove listener', () => {
            const listener = jasmine.createSpy('listener')

            service.addListener(listener)
            service.removeListener(listener)
            service.update(updater)

            expect(listener).not.toHaveBeenCalled()
        })

        it('should not remove other listeners if not added', () => {
            const listener = jasmine.createSpy('listener')

            service.addListener(listener)
            service.removeListener((_?: TestState) => {})
            service.update(updater)

            expect(listener).toHaveBeenCalledWith(state)
        })

        it('should not remove other listeners if added', () => {
            const listener = jasmine.createSpy('listener')
            const listenerToRemove = jasmine.createSpy('listenerToRemove')

            service.addListener(listener)
            service.addListener(listenerToRemove)
            service.removeListener(listenerToRemove)
            service.update(updater)

            expect(listener).toHaveBeenCalledWith(state)
            expect(listenerToRemove).not.toHaveBeenCalled()
        })
    })
})

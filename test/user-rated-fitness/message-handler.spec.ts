import { MessagePoster } from '../../src/common/message-poster'
import { FitnessUpdater } from '../../src/user-rated-fitness/fitness-updater'
import { messageHandler } from '../../src/user-rated-fitness/message-handler'
import { UserRatedFitnessMessage, UserRatedFitnessResultMessage } from '../../src/user-rated-fitness'

describe('messageHandler', () => {
    let postMessageSpy: jasmine.Spy<MessagePoster>
    let updaterSpy: jasmine.SpyObj<FitnessUpdater>

    beforeEach(() => {
        postMessageSpy = jasmine.createSpy('postMessage')
        updaterSpy = jasmine.createSpyObj<FitnessUpdater>('FitnessUpdater', [ 'update' ])
    })

    it('should throw if message data is not UserRatedFitnessMessage', () => {
        expect(() => messageHandler({ data: { prop: 1 } } as MessageEvent, postMessageSpy, updaterSpy))
            .toThrowError(/not a UserRatedFitnessMessage/i)
    })

    it('should throw if message data is undefined', () => {
        expect(() => messageHandler({} as MessageEvent, postMessageSpy, updaterSpy))
            .toThrowError(/not a UserRatedFitnessMessage/i)
    })

    it('should call update on FitnessUpdater with message data', () => {
        const data: UserRatedFitnessMessage = {
            kind: 'UserRatedFitnessMessage',
            fitnessValues: new Int8Array(0),
            userRepresentativeRatings: [],
            clusterResult: { assignments: [], representativeIndexes: [] }
        }

        messageHandler({ data } as MessageEvent, postMessageSpy, updaterSpy)

        expect(updaterSpy.update).toHaveBeenCalledWith(data)
    })

    it('should postMessage UserRatedFitnessResultMessage with updated fitnessValues', () => {
        const data: UserRatedFitnessMessage = {
            kind: 'UserRatedFitnessMessage',
            fitnessValues: new Int8Array([ 1, 2 ]),
            userRepresentativeRatings: [],
            clusterResult: { assignments: [], representativeIndexes: [] }
        }
        const result = new Int8Array([ 2, 3 ])
        updaterSpy.update.and.returnValue(result)

        messageHandler({ data } as MessageEvent, postMessageSpy, updaterSpy)

        expect(postMessageSpy).toHaveBeenCalledWith({
            type: 'UserRatedFitnessResultMessage',
            fitnessValues: result
        } as UserRatedFitnessResultMessage)
    })
})

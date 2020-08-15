import { MessagePoster } from '../../src/common/message-poster'
import { KMeansWorker } from '../../src/clustering/k-means-worker'
import { messageHandler } from '../../src/clustering/message-handler'
import { ClusterMessage } from '../../src/clustering/cluster-message'
import { ClusterResult } from '../../src/clustering'
import { ClusterWorkerMessageType } from '../../src/clustering/cluster-worker-message-type'

describe('messageHandler', () => {
    let postMessageSpy: jasmine.Spy<MessagePoster>
    let workerSpy: jasmine.SpyObj<KMeansWorker>

    beforeEach(() => {
        postMessageSpy = jasmine.createSpy<MessagePoster>('postMessage')
        workerSpy = jasmine.createSpyObj<KMeansWorker>('KMeansWorker', [ 'execute' ])

        workerSpy.execute.and.returnValue({ assignments: [], representativeIndexes: [] })
    })

    it('should throw if message population does not have array', () => {
        expect(() => messageHandler({
                data: {
                    kind: 'ClusterMessage',
                    population: { size: 1, genomeSize: 1 },
                    maxIterations: 1,
                    stopThreshold: 1
                } as ClusterMessage
            } as MessageEvent,
            postMessageSpy,
            workerSpy)).toThrowError(/population's array is undefined/i)
    })

    it('should throw if message is not ClusterMessage', () => {
        expect(() => messageHandler({
                data: { prop: 1 }
            } as MessageEvent,
            postMessageSpy,
            workerSpy)).toThrowError(/not a ClusterMessage/i)
    })

    it('should pass worker.execute result to postMessage', () => {
        const executeResult: ClusterResult = { assignments: [], representativeIndexes: [] }
        workerSpy.execute.and.returnValue(executeResult)
        const messageData: ClusterMessage = {
            population: { size: 1, genomeSize: 1, array: new Uint8Array(1) },
            maxIterations: 1,
            stopThreshold: 1,
            kind: 'ClusterMessage',
            numberOfRepresentatives: 1
        }

        messageHandler({ data: messageData } as MessageEvent, postMessageSpy, workerSpy)

        expect(workerSpy.execute).toHaveBeenCalledWith(jasmine.objectContaining({
            population: messageData.population,
            numberOfCentroids: messageData.numberOfRepresentatives,
            maxIterations: messageData.maxIterations,
            stopThreshold: messageData.stopThreshold
        }))
        expect(postMessageSpy).toHaveBeenCalledWith({ type: ClusterWorkerMessageType.Result, result: executeResult })
    })

    it('should give worker.execute a progressTracker that postMessages iteration number', () => {
        const messageData: ClusterMessage = {
            population: { size: 1, genomeSize: 1, array: new Uint8Array(1) },
            maxIterations: 1,
            stopThreshold: 1,
            kind: 'ClusterMessage',
            numberOfRepresentatives: 1
        }
        messageHandler({ data: messageData } as MessageEvent, postMessageSpy, workerSpy)
        const progressTracker = workerSpy.execute.calls.mostRecent().args[0].progressTracker

        expect(progressTracker).toBeDefined()

        const iteration = 4
        progressTracker(iteration)

        expect(postMessageSpy).toHaveBeenCalledWith({ type: ClusterWorkerMessageType.Progress, iteration })
    })
})

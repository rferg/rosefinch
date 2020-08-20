import { ClusterWorkerService } from '../../src/services/cluster-worker-service'
import { WorkerFactory } from '../../src/services/worker-factory'
import { WebWorkerType } from '../../src/services/web-worker-type'
import { ClusterMessage, ClusterWorkerMessageType, ClusterProgressMessage, ClusterResultMessage } from '../../src/clustering'

describe('ClusterWorkerService', () => {
    let service: ClusterWorkerService
    let workerSpy: jasmine.SpyObj<Worker>
    let workerFactorySpy: jasmine.SpyObj<WorkerFactory>
    let eventTargetSpy: jasmine.SpyObj<EventTarget>

    beforeEach(() => {
        workerSpy = jasmine.createSpyObj<Worker>('Worker', [ 'terminate', 'postMessage' ])
        workerFactorySpy = jasmine.createSpyObj<WorkerFactory>('WorkerFactory', [ 'getWorker' ])
        workerFactorySpy.getWorker.and.returnValue(workerSpy)
        eventTargetSpy = jasmine.createSpyObj<EventTarget>('EventTarget', [ 'dispatchEvent' ])
        service = new ClusterWorkerService(workerFactorySpy, eventTargetSpy)
    })
    describe('constructor', () => {
        it('should request worker from factory with WebWorkerType.Clustering', () => {
            expect(workerFactorySpy.getWorker).toHaveBeenCalledWith(WebWorkerType.Clustering)
        })
    })

    describe('run', () => {
        it('should post message', () => {
            const message = { kind: 'ClusterMessage' } as ClusterMessage

            service.run({ message, callbacks: {
                error: jasmine.createSpy(),
                [ClusterWorkerMessageType.Result]: jasmine.createSpy()
            }})

            expect(workerSpy.postMessage).toHaveBeenCalledWith(message)
        })
    })

    describe('onMessage', () => {
        let onMessage: (this: Worker, ev: MessageEvent) => any
        let resultCallback: jasmine.Spy
        let progressCallback: jasmine.Spy

        beforeEach(() => {
            onMessage = workerSpy.onmessage || (() => { throw new Error('onmessage was null') })()
            resultCallback = jasmine.createSpy('ResultCallback')
            progressCallback = jasmine.createSpy('ProgressCallback')
            service.run({ message: {} as ClusterMessage, callbacks: {
                [ClusterWorkerMessageType.Result]: resultCallback,
                [ClusterWorkerMessageType.Progress]: progressCallback,
                error: jasmine.createSpy()
            }})
        })

        it('should throw if invalid message', () => {
            expect(() => onMessage.call(workerSpy, { data: 1 } as MessageEvent))
                .toThrowError(/received invalid message/i)
        })

        it('should call progress callback if progress message', () => {
            const data = { type: ClusterWorkerMessageType.Progress } as ClusterProgressMessage

            onMessage.call(workerSpy, { data } as MessageEvent)

            expect(progressCallback).toHaveBeenCalledWith(data)
        })

        it('should call result callback if result message', () => {
            const data = {
                type: ClusterWorkerMessageType.Result,
                result: { }
            } as ClusterResultMessage

            onMessage.call(workerSpy, { data } as MessageEvent)

            expect(resultCallback).toHaveBeenCalledWith(data.result)
        })
    })
})

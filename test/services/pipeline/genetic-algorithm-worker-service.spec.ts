import { GeneticAlgorithmWorkerService } from '../../../src/services/pipeline/genetic-algorithm-worker-service'
import { WorkerFactory } from '../../../src/services/pipeline/worker-factory'
import { WebWorkerType } from '../../../src/services/pipeline/web-worker-type'
import { GeneticAlgorithmWorkerMessageType, ProgressMessage, ResultMessage, RunMessage } from '../../../src/genetic-algorithm'

describe('GeneticAlgorithmWorkerService', () => {
    let service: GeneticAlgorithmWorkerService
    let workerSpy: jasmine.SpyObj<Worker>
    let workerFactorySpy: jasmine.SpyObj<WorkerFactory>
    let eventTargetSpy: jasmine.SpyObj<EventTarget>

    beforeEach(() => {
        workerSpy = jasmine.createSpyObj<Worker>('Worker', [ 'terminate', 'postMessage' ])
        workerFactorySpy = jasmine.createSpyObj<WorkerFactory>('WorkerFactory', [ 'getWorker' ])
        workerFactorySpy.getWorker.and.returnValue(workerSpy)
        eventTargetSpy = jasmine.createSpyObj<EventTarget>('EventTarget', [ 'dispatchEvent' ])
        service = new GeneticAlgorithmWorkerService(workerFactorySpy, eventTargetSpy)
    })

    describe('constructor', () => {
        it('should request worker from factory with WebWorkerType.GeneticAlgorithm', () => {
            expect(workerFactorySpy.getWorker).toHaveBeenCalledWith(WebWorkerType.GeneticAlgorithm)
        })
    })

    describe('run', () => {
        it('should post message', () => {
            const message = { numberOfGenerations: 1 } as RunMessage

            service.run({ message, callbacks: {
                error: jasmine.createSpy(),
                [GeneticAlgorithmWorkerMessageType.Results]: jasmine.createSpy(),
                [GeneticAlgorithmWorkerMessageType.Progress]: jasmine.createSpy()
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
            service.run({ message: { numberOfGenerations: 1 } as RunMessage, callbacks: {
                [GeneticAlgorithmWorkerMessageType.Results]: resultCallback,
                [GeneticAlgorithmWorkerMessageType.Progress]: progressCallback,
                error: jasmine.createSpy()
            }})
        })

        it('should throw if invalid message', () => {
            expect(() => onMessage.call(workerSpy, { data: 1 } as MessageEvent))
                .toThrowError(/received invalid message/i)
        })

        it('should call progress callback if progress message', () => {
            const data = { type: GeneticAlgorithmWorkerMessageType.Progress } as ProgressMessage

            onMessage.call(workerSpy, { data } as MessageEvent)

            expect(progressCallback).toHaveBeenCalledWith(data)
        })

        it('should call result callback if result message', () => {
            const data = { type: GeneticAlgorithmWorkerMessageType.Results } as ResultMessage

            onMessage.call(workerSpy, { data } as MessageEvent)

            expect(resultCallback).toHaveBeenCalledWith(data)
        })
    })
})

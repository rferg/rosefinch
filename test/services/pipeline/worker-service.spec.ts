import { WorkerService } from '../../../src/services/pipeline/worker-service'
import { WorkerServiceCallbacks } from '../../../src/services/pipeline/worker-service-callbacks'
import { WorkerFactory } from '../../../src/services/pipeline/worker-factory'
import { WebWorkerType } from '../../../src/services/pipeline/web-worker-type'
import { WorkerEventType } from '../../../src/services/pipeline/worker-event-type'

class TestWorkerService extends WorkerService {

    constructor(
        private readonly messageListenerSpy: jasmine.Spy,
        workerType: WebWorkerType,
        workerFactory: WorkerFactory,
        eventTarget: EventTarget) {
        super(workerType, workerFactory, eventTarget)
    }

    run({ message, callbacks }: { message: any, callbacks: WorkerServiceCallbacks }): void {
        this.callbacks = callbacks
        this.postMessage(message)
    }
    protected onMessage(ev: MessageEvent): void {
        this.messageListenerSpy(ev)
    }
}

describe('WorkerService', () => {
    let service: TestWorkerService
    let messageListenerSpy: jasmine.Spy
    let workerFactorySpy: jasmine.SpyObj<WorkerFactory>
    let workerSpy: jasmine.SpyObj<Worker>
    let eventTargetSpy: jasmine.SpyObj<EventTarget>
    const workerType = WebWorkerType.GeneticAlgorithm

    beforeEach(() => {
        messageListenerSpy = jasmine.createSpy('messageListener')
        workerSpy = jasmine.createSpyObj<Worker>('Worker', [ 'postMessage', 'terminate' ])
        workerFactorySpy = jasmine.createSpyObj<WorkerFactory>('WorkerFactory', [ 'getWorker' ])
        workerFactorySpy.getWorker.and.returnValue(workerSpy)
        eventTargetSpy = jasmine.createSpyObj<EventTarget>('EventTarget', [ 'dispatchEvent' ])
        service = new TestWorkerService(messageListenerSpy, workerType, workerFactorySpy, eventTargetSpy)
    })

    describe('constructor', () => {
        it('should request worker from workerFactory', () => {
            expect(workerFactorySpy.getWorker).toHaveBeenCalledWith(workerType)
        })

        it('should define worker.onmessage and worker.onerror', () => {
            expect(workerSpy.onmessage).toBeDefined()
            expect(workerSpy.onerror).toBeDefined()
        })

        it('should define worker.onmessage to call onMessage', () => {
            const workerOnMessage = workerSpy.onmessage
            const message = { data: 'abc' } as MessageEvent
            if (!workerOnMessage) {
                fail('worker.onmessage was falsy')
            } else {
                workerOnMessage.call(workerSpy, message)

                expect(messageListenerSpy).toHaveBeenCalledWith(message)
            }
        })

        it('should define worker.onerror to dispatch error event', () => {
            const error = new ErrorEvent('testError')
            const expectedEvent = new CustomEvent<{ workerType: WebWorkerType, error: ErrorEvent }>(
                WorkerEventType.Error,
                {
                    detail: {
                        workerType,
                        error
                    }
                }
            )
            const workerOnError = workerSpy.onerror
            if (!workerOnError) {
                fail('worker.onerror was falsy')
            } else {
                workerOnError.call(workerSpy, error)

                expect(eventTargetSpy.dispatchEvent).toHaveBeenCalledWith(expectedEvent)
            }
        })

        it('should define worker.onerror to call error callback if defined', () => {
            const errorCallback = jasmine.createSpy('errorCallback')
            service.run({ callbacks: { error: errorCallback }, message: null })
            const workerOnError = workerSpy.onerror
            if (!workerOnError) {
                fail('worker.onerror was falsy')
            } else {
                const error = new ErrorEvent('')
                workerOnError.call(workerSpy, error)

                expect(errorCallback).toHaveBeenCalledWith(error)
            }
        })
    })

    describe('postMessage', () => {
        it('should call worker.postMessage with message', () => {
            const message = { data: 1 }
            service.run({ message, callbacks: { error: (_: ErrorEvent) => {} } })

            expect(workerSpy.postMessage).toHaveBeenCalledWith(message)
        })
    })
})

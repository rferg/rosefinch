import { UserRatedFitnessWorkerService } from '../../../src/services/pipeline/user-rated-fitness-worker-service'
import { WorkerFactory } from '../../../src/services/pipeline/worker-factory'
import { WebWorkerType } from '../../../src/services/pipeline/web-worker-type'
import { UserRatedFitnessMessage, UserRatedFitnessResultMessage } from '../../../src/user-rated-fitness'

describe('UserRatedFitnessWorkerService', () => {
    let service: UserRatedFitnessWorkerService
    let workerSpy: jasmine.SpyObj<Worker>
    let workerFactorySpy: jasmine.SpyObj<WorkerFactory>
    let eventTargetSpy: jasmine.SpyObj<EventTarget>

    beforeEach(() => {
        workerSpy = jasmine.createSpyObj<Worker>('Worker', [ 'terminate', 'postMessage' ])
        workerFactorySpy = jasmine.createSpyObj<WorkerFactory>('WorkerFactory', [ 'getWorker' ])
        workerFactorySpy.getWorker.and.returnValue(workerSpy)
        eventTargetSpy = jasmine.createSpyObj<EventTarget>('EventTarget', [ 'dispatchEvent' ])
        service = new UserRatedFitnessWorkerService(workerFactorySpy, eventTargetSpy)
    })

    describe('constructor', () => {
        it('should request worker from factory with WebWorkerType.UserRatedFitness', () => {
            expect(workerFactorySpy.getWorker).toHaveBeenCalledWith(WebWorkerType.UserRatedFitness)
        })
    })

    describe('run', () => {
        it('should post message', () => {
            const message = { kind: 'UserRatedFitnessMessage' } as UserRatedFitnessMessage

            service.run({ message, callbacks: {
                error: jasmine.createSpy(),
                result: jasmine.createSpy()
            }})

            expect(workerSpy.postMessage).toHaveBeenCalledWith(message)
        })
    })

    describe('onMessage', () => {
        let onMessage: (this: Worker, ev: MessageEvent) => any
        let resultCallback: jasmine.Spy

        beforeEach(() => {
            onMessage = workerSpy.onmessage || (() => { throw new Error('onmessage was null') })()
            resultCallback = jasmine.createSpy('ResultCallback')
            service.run({ message: { kind: 'UserRatedFitnessMessage' } as UserRatedFitnessMessage, callbacks: {
                result: resultCallback,
                error: jasmine.createSpy()
            }})
        })

        it('should throw if invalid message', () => {
            expect(() => onMessage.call(workerSpy, { data: 1 } as MessageEvent))
                .toThrowError(/received invalid message/i)
        })

        it('should call result callback if result message', () => {
            const data = {
                type: 'UserRatedFitnessResultMessage',
                fitnessValues: new Int8Array(0)
            } as UserRatedFitnessResultMessage

            onMessage.call(workerSpy, { data } as MessageEvent)

            expect(resultCallback).toHaveBeenCalledWith(data.fitnessValues)
        })
    })
})

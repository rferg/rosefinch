import { WorkerService } from './worker-service'
import { WorkerFactory } from './worker-factory'
import { globalEventTargetToken } from '../common/global-event-target-token'
import { WebWorkerType } from './web-worker-type'
import { Inject } from 'cewdi'
import { UserRatedFitnessMessage, UserRatedFitnessResultMessage } from '../user-rated-fitness'

type UserRatedFitnessCallback = (fitnessValues: Int8Array) => void

export class UserRatedFitnessWorkerService extends WorkerService {
    private callback?: UserRatedFitnessCallback

    constructor(
        workerFactory: WorkerFactory,
        @Inject(globalEventTargetToken) eventTarget: EventTarget) {
        super(WebWorkerType.UserRatedFitness, workerFactory, eventTarget)
    }

    run({
        message,
        callback
    }: {
        message: UserRatedFitnessMessage,
        callback: UserRatedFitnessCallback
    }): void {
        this.callback = callback
        this.postMessage(message)
    }

    protected onMessageListener({ data }: MessageEvent): void {
        if (this.isUserRatedFitnessResultMessage(data)) {
            if (this.callback) { this.callback(data.fitnessValues) }
        } else {
            throw new Error(`UserRatedFitnessWorkerService received invalid message ${data}`)
        }
    }

    private isUserRatedFitnessResultMessage(data: any): data is UserRatedFitnessResultMessage {
        return (data as UserRatedFitnessResultMessage)?.type === 'UserRatedFitnessResultMessage'
    }
}

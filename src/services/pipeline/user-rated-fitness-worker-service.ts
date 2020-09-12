import { WorkerService } from './worker-service'
import { WorkerFactory } from './worker-factory'
import { globalEventTargetToken } from '../../common/global-event-target-token'
import { WebWorkerType } from './web-worker-type'
import { Inject, Injectable } from 'cewdi'
import { UserRatedFitnessMessage, UserRatedFitnessResultMessage } from '../../user-rated-fitness'
import { WorkerServiceCallbacks } from './worker-service-callbacks'

interface UserRatedFitnessCallbacks extends WorkerServiceCallbacks {
    result: (fitnessValues: Int8Array) => void
}

@Injectable()
export class UserRatedFitnessWorkerService extends WorkerService {
    protected callbacks?: UserRatedFitnessCallbacks

    constructor(
        workerFactory: WorkerFactory,
        @Inject(globalEventTargetToken) eventTarget: EventTarget) {
        super(WebWorkerType.UserRatedFitness, workerFactory, eventTarget)
    }

    run({
        message,
        callbacks
    }: {
        message: UserRatedFitnessMessage,
        callbacks: UserRatedFitnessCallbacks
    }): void {
        this.callbacks = callbacks
        this.postMessage(message)
    }

    protected onMessage({ data }: MessageEvent): void {
        if (this.isUserRatedFitnessResultMessage(data)) {
            const callback = this.callbacks?.result
            if (callback) { callback(data.fitnessValues) }
        } else {
            throw new Error(`UserRatedFitnessWorkerService received invalid message ${data}`)
        }
    }

    private isUserRatedFitnessResultMessage(data: any): data is UserRatedFitnessResultMessage {
        return (data as UserRatedFitnessResultMessage)?.type === 'UserRatedFitnessResultMessage'
    }
}

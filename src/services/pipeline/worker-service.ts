import { WebWorkerType } from './web-worker-type'
import { WorkerFactory } from './worker-factory'
import { WorkerEventType } from './worker-event-type'
import { Inject } from 'cewdi'
import { globalEventTargetToken } from '../../common/global-event-target-token'
import { WorkerServiceCallbacks } from './worker-service-callbacks'

export abstract class WorkerService {
    protected callbacks?: WorkerServiceCallbacks
    private worker: Worker

    constructor(
        private readonly workerType: WebWorkerType,
        private readonly workerFactory: WorkerFactory,
        @Inject(globalEventTargetToken) private readonly eventTarget: EventTarget) {
            this.worker = this.workerFactory.getWorker(this.workerType)
            this.worker.onmessage = (ev) => this.onMessage(ev)
            this.worker.onerror = (ev) => this.onError(ev)
    }

    terminate(): void {
        if (this.worker) {
            this.worker.terminate()
            this.eventTarget.dispatchEvent(new CustomEvent<WebWorkerType>(
                WorkerEventType.Terminated,
                {
                    detail: this.workerType
                }))
        }
        this.worker = this.workerFactory.getWorker(this.workerType)
    }

    abstract run({ message, callbacks }: { message: any, callbacks: WorkerServiceCallbacks }): void

    protected abstract onMessage(message: MessageEvent): void

    protected onError(error: ErrorEvent): void {
        this.eventTarget.dispatchEvent(new CustomEvent<{ workerType: WebWorkerType, error: ErrorEvent }>(
            WorkerEventType.Error,
            {
                detail: {
                    workerType: this.workerType,
                    error
                }
            }
        ))

        const errorCallback = this.callbacks?.error
        if (errorCallback) { errorCallback(error) }
    }

    protected postMessage(message: any): void {
        if (!this.worker) { this.worker = this.workerFactory.getWorker(this.workerType) }
        this.worker.postMessage(message)
    }
}

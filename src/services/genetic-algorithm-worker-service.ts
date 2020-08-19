import { Inject, Injectable } from 'cewdi'
import { WorkerService } from './worker-service'
import { GeneticAlgorithmWorkerMessageType, ProgressMessage, ResultMessage, RunMessage } from '../genetic-algorithm'
import { WebWorkerType } from './web-worker-type'
import { WorkerFactory } from './worker-factory'
import { globalEventTargetToken } from '../common/global-event-target-token'

type GeneticAlgorithmCallbacks = {
    [GeneticAlgorithmWorkerMessageType.Progress]: (message: ProgressMessage) => void,
    [GeneticAlgorithmWorkerMessageType.Results]: (message: ResultMessage) => void
}

@Injectable()
export class GeneticAlgorithmWorkerService extends WorkerService {
    private callbacks?: GeneticAlgorithmCallbacks

    constructor(
        workerFactory: WorkerFactory,
        @Inject(globalEventTargetToken) eventTarget: EventTarget) {
        super(WebWorkerType.GeneticAlgorithm, workerFactory, eventTarget)
    }

    run({
        message,
        callbacks
    }: {
        message: RunMessage,
        callbacks: GeneticAlgorithmCallbacks
    }): void {
        this.callbacks = callbacks
        this.postMessage(message)
    }

    protected onMessageListener({ data }: MessageEvent): void {
        if (this.isProgressMessage(data)) {
            const callback = this.callbacks?.[GeneticAlgorithmWorkerMessageType.Progress]
            if (callback) { callback(data) }
        } else if (this.isResultMessage(data)) {
            const callback = this.callbacks?.[GeneticAlgorithmWorkerMessageType.Results]
            if (callback) { callback(data) }
        } else {
            throw new Error(`GeneticAlgorithmWorkerService received invalid message ${data}!`)
        }
    }

    private isProgressMessage(data: any): data is ProgressMessage {
        return (data as ProgressMessage)?.type === GeneticAlgorithmWorkerMessageType.Progress
    }

    private isResultMessage(data: any): data is ResultMessage {
        return (data as ResultMessage)?.type === GeneticAlgorithmWorkerMessageType.Results
    }
}

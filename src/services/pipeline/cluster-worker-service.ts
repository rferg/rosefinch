import { Inject, Injectable } from 'cewdi'
import { WorkerFactory } from './worker-factory'
import { WorkerService } from './worker-service'
import { WebWorkerType } from './web-worker-type'
import { globalEventTargetToken } from '../../common/global-event-target-token'
import {
    ClusterMessage,
    ClusterProgressMessage,
    ClusterResult,
    ClusterResultMessage,
    ClusterWorkerMessageType
} from '../../clustering'
import { WorkerServiceCallbacks } from './worker-service-callbacks'

interface ClusterCallbacks extends WorkerServiceCallbacks {
    [ClusterWorkerMessageType.Result]: (result: ClusterResult) => any,
    [ClusterWorkerMessageType.Progress]?: (message: ClusterProgressMessage) => any
}
@Injectable()
export class ClusterWorkerService extends WorkerService {
    protected callbacks?: ClusterCallbacks

    constructor(
        workerFactory: WorkerFactory,
        @Inject(globalEventTargetToken) eventTarget: EventTarget) {
        super(WebWorkerType.Clustering, workerFactory, eventTarget)
    }

    run({
        message,
        callbacks
    }: {
        message: ClusterMessage,
        callbacks: ClusterCallbacks
    }): void {
        this.callbacks = callbacks
        this.postMessage(message)
    }

    protected onMessage({ data }: MessageEvent): void {
        if (this.isClusterProgressMessage(data)) {
            const callback = this.callbacks?.[ClusterWorkerMessageType.Progress]
            if (callback) { callback(data) }
        } else if (this.isClusterResultMessage(data)) {
            const callback = this.callbacks?.[ClusterWorkerMessageType.Result]
            if (callback) { callback(data?.result) }
        } else {
            throw new Error(`ClusterWorkerService received invalid message ${data}!`)
        }
    }

    private isClusterProgressMessage(data: any): data is ClusterProgressMessage {
        return (data as ClusterProgressMessage)?.type === ClusterWorkerMessageType.Progress
    }

    private isClusterResultMessage(data: any): data is ClusterResultMessage {
        return (data as ClusterResultMessage)?.type === ClusterWorkerMessageType.Result
    }
}

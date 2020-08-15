import { MessagePoster } from '../common/message-poster'
import { KMeansWorker } from './k-means-worker'
import { ClusterMessage } from './cluster-message'
import { ClusterProgressMessage } from './cluster-progress-message'
import { ClusterWorkerMessageType } from './cluster-worker-message-type'
import { ClusterResultMessage } from './cluster-result-message'

export function messageHandler({ data }: MessageEvent, postMessage: MessagePoster, worker: KMeansWorker): void {
    validateMessageData(data)

    const {
        population,
        numberOfRepresentatives: numberOfCentroids,
        maxIterations,
        stopThreshold
    } = data as ClusterMessage

    const progressTracker = (iteration: number) => postMessage({
        type: ClusterWorkerMessageType.Progress,
        iteration
    } as ClusterProgressMessage)

    const result = worker.execute({
        population,
        numberOfCentroids,
        maxIterations,
        stopThreshold,
        progressTracker
    })

    postMessage({
        type: ClusterWorkerMessageType.Result,
        result
    } as ClusterResultMessage)
}

function validateMessageData(data: ClusterMessage): void {
    if (!isClusterMessage(data)) {
        throw new Error(`Message data ${data} is not a ClusterMessage.`)
    }

    if (!data?.population.array) {
        throw new Error(`ClusterMessage ${data} population's array is undefined.`)
    }
}

function isClusterMessage(x: any): x is ClusterMessage {
    return (x as ClusterMessage)?.kind === 'ClusterMessage'
}

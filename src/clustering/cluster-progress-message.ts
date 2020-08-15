import { ClusterWorkerMessageType } from './cluster-worker-message-type'

export interface ClusterProgressMessage {
    type: ClusterWorkerMessageType.Progress
    iteration: number
}

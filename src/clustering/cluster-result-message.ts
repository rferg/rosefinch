import { ClusterWorkerMessageType } from './cluster-worker-message-type'
import { ClusterResult } from './cluster-result'

export interface ClusterResultMessage {
    type: ClusterWorkerMessageType.Result
    result: ClusterResult
}

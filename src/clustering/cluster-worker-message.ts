import { ClusterResultMessage } from './cluster-result-message'
import { ClusterProgressMessage } from './cluster-progress-message'

export type ClusterWorkerMessage = ClusterResultMessage | ClusterProgressMessage

import { ClusterProgressMessage } from '../../clustering'
import { ProgressMessage } from '../../genetic-algorithm'
import { PipelineStageName } from './pipeline-stage-name'

export interface PipelineProgressReport {
    stageName: PipelineStageName,
    detail: ({ message: string }) | ProgressMessage | ClusterProgressMessage
}

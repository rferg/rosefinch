import { PipelineStageName } from './pipeline-stage-name'
import { ProgressMessage } from '../genetic-algorithm'
import { ClusterProgressMessage } from '../clustering'

export type PipelineProgressCallback = (report: {
    stageName: PipelineStageName,
    detail: ({ message: string }) | ProgressMessage | ClusterProgressMessage
}) => any

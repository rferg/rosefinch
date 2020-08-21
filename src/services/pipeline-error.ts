import { PipelineStageName } from './pipeline-stage-name'

export interface PipelineError {
    stageName: PipelineStageName,
    error: any
}

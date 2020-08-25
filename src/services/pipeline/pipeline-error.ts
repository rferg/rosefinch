import { PipelineStageName } from './pipeline-stage-name'

export interface PipelineError<TState> {
    stageName: PipelineStageName
    error: any
    input?: TState
}

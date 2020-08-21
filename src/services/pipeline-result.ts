import { PipelineError } from './pipeline-error'

export interface PipelineResult<TState> {
    result: TState
    isCanceled: boolean
    error: PipelineError | undefined
}

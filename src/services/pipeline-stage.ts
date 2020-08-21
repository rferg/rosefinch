import { PipelineStageName } from './pipeline-stage-name'
import { PipelineProgressCallback } from './pipeline-progress-callback'

export interface PipelineStage<TState extends { [k: string]: any, [k: number]: any }> {
    name: PipelineStageName
    execute(
        state?: TState,
        progressCallback?: PipelineProgressCallback): { cancel: () => Promise<void>, result: Promise<TState> }
    rollback(input?: TState, output?: TState): Promise<void>
}

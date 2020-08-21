import { PipelineStage } from './pipeline-stage'
import { PipelineProgressCallback } from './pipeline-progress-callback'
import { PipelineError } from './pipeline-error'
import { PipelineResult } from './pipeline-result'

interface Execution<TState extends { [k: string]: any, [k: number]: any }> {
    stage: PipelineStage<TState>
    cancel: () => Promise<void>
    result: Promise<TState>
    input?: TState
}

interface CompletedExecution<TState extends { [k: string]: any, [k: number]: any }> extends Execution<TState> {
    output?: TState
}

export class SharedStatePipeline<TState extends { [k: string]: any, [k: number]: any }> {
    private readonly completedExecutions: CompletedExecution<TState>[] = []
    private currentExecution?: Execution<TState>
    private currentState?: TState
    private isCanceled = false

    constructor(private readonly stages: PipelineStage<TState>[]) {
    }

    async run(
        initialState: TState,
        progressCallback?: PipelineProgressCallback): Promise<PipelineResult<TState>> {
        this.currentState = initialState
        let error: PipelineError | undefined = undefined

        for (const stage of this.stages) {
            if (this.isCanceled) { break }

            const { cancel, result } = stage.execute(this.currentState, progressCallback)
            this.currentExecution = {
                stage,
                cancel,
                result,
                input: { ...(this.currentState || {}) }
            }

            try {
                const output = await result
                this.currentState = { ...(this.currentState || {}), ...(output || {}) }
                this.completedExecutions.push({ ...this.currentExecution, output })
            } catch (err) {
                error = { error: err, stageName: stage.name }
                break
            } finally {
                this.currentExecution = undefined
            }
        }

        if (this.isCanceled || error) {
            await this.rollback()
        }
        return Promise.resolve({
            result: this.currentState,
            isCanceled: this.isCanceled,
            error
        })
    }

    async cancel(): Promise<void> {
        this.isCanceled = true
        if (this.currentExecution) {
            await this.currentExecution.cancel()
            this.currentExecution = undefined
        }
        return Promise.resolve()
    }

    private async rollback(): Promise<void> {
        if (this.currentExecution) {
            await this.cancel()
        }
        for (let index = this.completedExecutions.length - 1; index >= 0; index--) {
            const { input, output, stage: { rollback } } = this.completedExecutions[index]
            await rollback(input, output)
        }
        return Promise.resolve()
    }
}
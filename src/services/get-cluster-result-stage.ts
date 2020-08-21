import { PipelineStage } from './pipeline-stage'
import { PipelineStageName } from './pipeline-stage-name'
import { ClusterResultRepository } from '../storage'
import { PipelineState } from './pipeline-state'
import { PipelineProgressCallback } from './pipeline-progress-callback'

export class GetClusterResultStage implements PipelineStage<PipelineState> {
    readonly name: PipelineStageName = PipelineStageName.GetClusterResult

    constructor(private readonly repo: ClusterResultRepository) {}

    execute(
        state?: PipelineState,
        progressCallback?: PipelineProgressCallback): { cancel: () => Promise<void>; result: Promise<PipelineState> } {
            if (progressCallback) {
                progressCallback({ stageName: this.name, detail: { message: `Retrieving Cluster Result...` } })
            }
            const cancel = () => Promise.resolve()
            const result = state?.clusterResult ? Promise.resolve(state) : this.getQueryPromise(state)
            return { cancel, result }
    }

    async rollback(_?: PipelineState, __?: PipelineState): Promise<void> {
        // Procedure does not alter anything, so nothing to roll back.
        return
    }

    private getQueryPromise(state?: PipelineState): Promise<PipelineState> {
        return this.repo.get(state?.geneticAlgorithmId || '')
            .then(clusterResult => {
                if (!clusterResult) {
                    throw new Error(`No Cluster Result found with id ${state?.geneticAlgorithmId}!`)
                }
                return {
                    geneticAlgorithmId: state?.geneticAlgorithmId || '',
                    numberOfGenerations: state?.numberOfGenerations || 0,
                    clusterResult
                }
            })
    }
}

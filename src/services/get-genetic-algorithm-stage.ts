import { PipelineState } from './pipeline-state'
import { PipelineStage } from './pipeline-stage'
import { PipelineStageName } from './pipeline-stage-name'
import { PipelineProgressCallback } from './pipeline-progress-callback'
import { GeneticAlgorithmRepository } from '../storage'

export class GetGeneticAlgorithmStage implements PipelineStage<PipelineState> {
    readonly name: PipelineStageName = PipelineStageName.GetGeneticAlgorithm

    constructor(private readonly repo: GeneticAlgorithmRepository) { }

    execute(
        state?: PipelineState,
        progressCallback?: PipelineProgressCallback): { cancel: () => Promise<void>; result: Promise<PipelineState> } {
            if (progressCallback) {
                progressCallback({ stageName: this.name, detail: { message: `Retrieving Genetic Algorithm...` } })
            }
            return {
                cancel: () => Promise.resolve(),
                result: this.repo.get(state?.geneticAlgorithmId || '')
                    .then(geneticAlgorithm => {
                        if (!geneticAlgorithm) {
                            throw new Error(`No Genetic Algorithm found with id ${state?.geneticAlgorithmId}!`)
                        }
                        return {
                            geneticAlgorithmId: state?.geneticAlgorithmId || '',
                            numberOfGenerations: state?.numberOfGenerations || 0,
                            geneticAlgorithm: geneticAlgorithm
                        }
                    })
            }
    }

    async rollback(_?: PipelineState, __?: PipelineState): Promise<void> {
        // Procedure does not alter anything, so nothing to roll back.
        return
    }

}

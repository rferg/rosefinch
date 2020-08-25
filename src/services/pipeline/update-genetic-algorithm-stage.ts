import { PipelineStage } from './pipeline-stage'
import { PipelineState } from './pipeline-state'
import { PipelineStageName } from './pipeline-stage-name'
import { PipelineProgressCallback } from './pipeline-progress-callback'
import { GeneticAlgorithmRepository, GeneticAlgorithmStore } from '../../storage'

export class UpdateGeneticAlgorithmStage implements PipelineStage<PipelineState> {
    readonly name: PipelineStageName = PipelineStageName.UpdateGeneticAlgorithm
    private original?: GeneticAlgorithmStore
    private didUpdate = false

    constructor(private readonly repo: GeneticAlgorithmRepository) {}

    execute(
        state?: PipelineState,
        progressCallback?: PipelineProgressCallback): { cancel: () => Promise<void>, result: Promise<PipelineState> } {
        if (progressCallback) {
            progressCallback({ stageName: this.name, detail: { message: 'Updating Genetic Algorithm...' } })
        }
        return {
            cancel: () => Promise.resolve(),
            result: this.update(state)
        }
    }

    async rollback(input?: PipelineState, __?: PipelineState): Promise<void> {
        if (!this.didUpdate) {
            return
        }
        if (!input) {
            throw new Error(`No input state provided for ${this.name} rollback.`)
        }
        if (!input.geneticAlgorithm) {
            throw new Error('State is missing geneticAlgorithm.')
        }

        const current = await this.repo.get(input.geneticAlgorithm?.id)
        if (!current && !this.original) {
            // New record that was never actually created, despite didUpdate.
            return
        }

        if (!this.original) {
            await this.repo.delete(input.geneticAlgorithmId)
        } else {
            await this.repo.put(this.original, this.original.id)
        }
    }

    private async update(state?: PipelineState): Promise<PipelineState> {
        if (!state) {
            throw new Error('State is missing.')
        }
        if (!state.geneticAlgorithm) {
            throw new Error('State is missing geneticAlgorithm.')
        }

        this.original = await this.repo.get(state.geneticAlgorithm.id)
        if (!this.original) {
            await this.repo.add(state.geneticAlgorithm)
        } else {
            await this.repo.put({ ...this.original, ...state.geneticAlgorithm }, state.geneticAlgorithm.id)
        }
        this.didUpdate = true
        return state
    }
}

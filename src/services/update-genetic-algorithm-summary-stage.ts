import { PipelineStage } from './pipeline-stage'
import { PipelineState } from './pipeline-state'
import { PipelineStageName } from './pipeline-stage-name'
import { GeneticAlgorithmStore, GeneticAlgorithmSummaryRepository, GeneticAlgorithmSummaryStore } from '../storage'
import { PipelineProgressCallback } from './pipeline-progress-callback'

export class UpdateGeneticAlgorithmSummaryStage implements PipelineStage<PipelineState> {
    readonly name: PipelineStageName = PipelineStageName.UpdateGeneticAlgorithmSummary
    private original?: GeneticAlgorithmSummaryStore
    private didUpdate = false

    constructor(private readonly repo: GeneticAlgorithmSummaryRepository) {}

    execute(
        state?: PipelineState,
        progressCallback?: PipelineProgressCallback): { cancel: () => Promise<void>, result: Promise<PipelineState> } {
        if (progressCallback) {
            progressCallback({ stageName: this.name, detail: { message: 'Updating Genetic Algorithm Summary...' } })
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

        const summary = this.getSummaryFromGeneticAlgorithm(state.geneticAlgorithm)
        this.original = await this.repo.get(summary.id)
        if (!this.original) {
            await this.repo.add(summary)
        } else {
            await this.repo.put({ ...this.original, ...summary }, summary.id)
        }
        this.didUpdate = true
        return state
    }

    private getSummaryFromGeneticAlgorithm(ga: GeneticAlgorithmStore): GeneticAlgorithmSummaryStore {
        return {
            id: ga.id,
            storeName: 'geneticAlgorithmSummary',
            generation: ga.generation,
            lastRunOn: new Date()
        }
    }
}

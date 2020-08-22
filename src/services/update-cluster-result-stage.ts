import { PipelineState } from './pipeline-state'
import { ClusterResultRepository, ClusterResultStore } from '../storage'
import { ClusterResult } from '../clustering'
import { PipelineStage } from './pipeline-stage'
import { PipelineStageName } from './pipeline-stage-name'
import { PipelineProgressCallback } from './pipeline-progress-callback'

export class UpdateClusterResultStage implements PipelineStage<PipelineState> {
    readonly name: PipelineStageName = PipelineStageName.UpdateClusterResult
    private original?: ClusterResultStore
    private didUpdate = false

    constructor(private readonly repo: ClusterResultRepository) {}

    execute(
        state?: PipelineState,
        progressCallback?: PipelineProgressCallback): { cancel: () => Promise<void>, result: Promise<PipelineState> } {
        if (progressCallback) {
            progressCallback({ stageName: this.name, detail: { message: 'Updating Cluster Result...' } })
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
        if (!input.clusterResult) {
            throw new Error('State is missing clusterResult.')
        }

        const current = await this.repo.get(input.geneticAlgorithmId)
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
        if (!state.clusterResult) {
            throw new Error('State is missing clusterResult.')
        }

        if (!this.isStore(state.clusterResult)) {
            state.clusterResult = this.resultToStore(
                state.clusterResult,
                state.geneticAlgorithmId,
                state.geneticAlgorithm?.generation ?? 0)
        }
        this.original = await this.repo.get(state.geneticAlgorithmId)
        if (!this.original) {
            await this.repo.add(state.clusterResult as ClusterResultStore)
        } else {
            await this.repo.put({ ...this.original, ...state.clusterResult }, state.geneticAlgorithmId)
        }
        this.didUpdate = true
        return state
    }

    private isStore(obj: ClusterResultStore | ClusterResult): obj is ClusterResultStore {
        return (obj as ClusterResultStore).storeName === 'clusterResult'
    }

    private resultToStore(result: ClusterResult, id: string, generation: number): ClusterResultStore {
        return {
            ...result,
            storeName: 'clusterResult',
            id,
            generation
        }
    }
}

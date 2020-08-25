import { PipelineStage } from './pipeline-stage'
import { PipelineState } from './pipeline-state'
import { PipelineStageName } from './pipeline-stage-name'
import { PipelineProgressCallback } from './pipeline-progress-callback'

export class GetRepresentativeGenesStage implements PipelineStage<PipelineState> {
    readonly name: PipelineStageName = PipelineStageName.GetRepresentativeGenes

    execute(
        state?: PipelineState,
        progressCallback?: PipelineProgressCallback): { cancel: () => Promise<void>, result: Promise<PipelineState> } {
        if (progressCallback) {
            progressCallback({ stageName: this.name, detail: { message: `Starting ${this.name}...` } })
        }

        return {
            cancel: () => Promise.resolve(),
            result: new Promise((resolve, reject) => {
                if (!state) {
                    reject('State is missing.')
                } else if (!state.clusterResult?.representativeIndexes) {
                    reject('State is missing clusterResult.representativeIndexes.')
                } else if (!state.geneticAlgorithm?.population.array) {
                    reject('State is missing geneticAlgorithm.population.array.')
                } else {
                    const genomeSize = state.geneticAlgorithm.population.genomeSize
                    const representativeGenes = state.clusterResult.representativeIndexes
                        .map(repIdx => {
                            if (repIdx === undefined) { return undefined }
                            const genes = state.geneticAlgorithm?.population.array
                                ?.slice(repIdx * genomeSize, (repIdx * genomeSize) + genomeSize)
                            if (!(genes && genes.length)) { return undefined }
                            return [ ...genes ]
                        })
                    resolve({
                        representativeGenes,
                        geneticAlgorithmId: state.geneticAlgorithmId,
                        numberOfGenerations: state.numberOfGenerations
                    })
                }
            })
        }
    }

    async rollback(_?: PipelineState, __?: PipelineState): Promise<void> {
        return
    }
}

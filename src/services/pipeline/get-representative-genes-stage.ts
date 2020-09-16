import { PipelineStage } from './pipeline-stage'
import { PipelineState } from './pipeline-state'
import { PipelineStageName } from './pipeline-stage-name'
import { PipelineProgressCallback } from './pipeline-progress-callback'
import { RepresentativeGenesService } from './representative-genes-service'

export class GetRepresentativeGenesStage implements PipelineStage<PipelineState> {
    readonly name: PipelineStageName = PipelineStageName.GetRepresentativeGenes

    constructor(private readonly representativeGenesService: RepresentativeGenesService) {}

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
                    const representativeGenes = this.representativeGenesService.extractGenes(
                        state.geneticAlgorithm.population,
                        state.clusterResult.representativeIndexes)
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

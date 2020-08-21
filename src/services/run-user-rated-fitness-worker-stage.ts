import { PipelineStage } from './pipeline-stage'
import { PipelineState } from './pipeline-state'
import { PipelineStageName } from './pipeline-stage-name'
import { UserRatedFitnessWorkerService } from './user-rated-fitness-worker-service'
import { PipelineProgressCallback } from './pipeline-progress-callback'
import { UserRatedFitnessMessage } from '../user-rated-fitness'

export class RunUserRatedFitnessWorkerStage implements PipelineStage<PipelineState> {
    readonly name: PipelineStageName = PipelineStageName.RunUserRatedFitnessWorker

    constructor(private readonly service: UserRatedFitnessWorkerService) {}

    execute(
        state?: PipelineState,
        progressCallback?: PipelineProgressCallback): { cancel: () => Promise<void>, result: Promise<PipelineState> } {
            if (progressCallback) {
                progressCallback({ stageName: this.name, detail: { message: `Starting ${this.name}...` } })
            }
            return {
                cancel: async () => this.service.terminate(),
                result: !state || state.userRepresentativeRatings?.length
                    ? this.runWorker(state, progressCallback)
                    : Promise.resolve(state)
            }
    }

    async rollback(_?: PipelineState, __?: PipelineState): Promise<void> {
        return
    }

    private runWorker(state?: PipelineState, _?: PipelineProgressCallback): Promise<PipelineState> {
        return new Promise((resolve, reject) => {
            if (!state) {
                reject('State is missing.')
            } else if (!state.geneticAlgorithm) {
                reject('State is missing geneticAlgorithm.')
            } else if (!state.geneticAlgorithm.fitnessValues) {
                reject('State is missing fitnessValues.')
            } else if (!state.clusterResult) {
                reject('State is missing clusterResult.')
            } else if (!state.userRepresentativeRatings) {
                reject('State is missing userRepresentativeRatings.')
            } else {
                const message: UserRatedFitnessMessage = {
                    kind: 'UserRatedFitnessMessage',
                    fitnessValues: state.geneticAlgorithm.fitnessValues,
                    clusterResult: state.clusterResult,
                    userRepresentativeRatings: state.userRepresentativeRatings
                }
                this.service.run({
                    message,
                    callbacks: {
                        error: (err) => reject(err),
                        result: (fitnessValues: Int8Array) => {
                            if (state.geneticAlgorithm) {
                                state.geneticAlgorithm.fitnessValues = fitnessValues
                            }
                            resolve({
                                geneticAlgorithmId: state.geneticAlgorithmId,
                                numberOfGenerations: state.numberOfGenerations,
                                geneticAlgorithm: state.geneticAlgorithm
                            })
                        }
                    }
                })
            }
        })
    }
}

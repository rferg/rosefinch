import { PipelineStage } from './pipeline-stage'
import { PipelineState } from './pipeline-state'
import { PipelineStageName } from './pipeline-stage-name'
import { GeneticAlgorithmWorkerService } from '../genetic-algorithm-worker-service'
import { PipelineProgressCallback } from './pipeline-progress-callback'
import { GeneticAlgorithmWorkerMessageType, ProgressMessage, RunMessage } from '../../genetic-algorithm'

export class RunGeneticAlgorithmWorkerStage implements PipelineStage<PipelineState> {
    readonly name: PipelineStageName = PipelineStageName.RunGeneticAlgorithmWorker

    constructor(private readonly service: GeneticAlgorithmWorkerService) {}

    execute(
        state?: PipelineState,
        progressCallback?: PipelineProgressCallback): { cancel: () => Promise<void>, result: Promise<PipelineState> } {
            if (progressCallback) {
                progressCallback({ stageName: this.name, detail: { message: `Starting ${this.name}...` } })
            }
            return {
                cancel: async () => this.service.terminate(),
                result: this.runWorker(state, progressCallback)
            }
    }

    async rollback(_?: PipelineState, __?: PipelineState): Promise<void> {
        return
    }

    private runWorker(
        state?: PipelineState,
        progressCallback?: PipelineProgressCallback): Promise<PipelineState> {
        return new Promise((resolve, reject) => {
            if (!state) {
                reject('State is missing.')
            } else if (!state.geneticAlgorithm) {
                reject('State is missing geneticAlgorithm.')
            } else {
                const message: RunMessage = {
                    geneticAlgorithm: state.geneticAlgorithm,
                    numberOfGenerations: state.numberOfGenerations
                }

                this.service.run({
                    message,
                    callbacks: {
                        error: err => reject(err),
                        [GeneticAlgorithmWorkerMessageType.Results]: ({ generation, population, fitnessValues }) => {
                            if (state.geneticAlgorithm) {
                                state.geneticAlgorithm = {
                                    ...state.geneticAlgorithm,
                                    generation,
                                    population,
                                    fitnessValues
                                }
                            }
                            resolve({
                                geneticAlgorithm: state.geneticAlgorithm,
                                numberOfGenerations: state.numberOfGenerations,
                                geneticAlgorithmId: state.geneticAlgorithmId
                            })
                        },
                        [GeneticAlgorithmWorkerMessageType.Progress]: (message: ProgressMessage) => {
                            if (progressCallback) { progressCallback({ stageName: this.name, detail: message }) }
                        }
                    }
                })
            }
        })
    }
}

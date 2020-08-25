import { PipelineStage } from './pipeline-stage'
import { PipelineState } from './pipeline-state'
import { PipelineStageName } from './pipeline-stage-name'
import { ClusterWorkerService } from '../cluster-worker-service'
import { PipelineProgressCallback } from './pipeline-progress-callback'
import { ClusterConfigProvider } from '../cluster-config-provider'
import { ClusterMessage, ClusterWorkerMessageType } from '../../clustering'

export class RunClusterWorkerStage implements PipelineStage<PipelineState> {
    readonly name: PipelineStageName = PipelineStageName.RunClusterWorker

    constructor(private readonly service: ClusterWorkerService, private readonly config: ClusterConfigProvider) {}

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
            } else if (!state.geneticAlgorithm.population) {
                reject('State is missing geneticAlgorithm.population.')
            } else {
                const message: ClusterMessage = {
                    kind: 'ClusterMessage',
                    population: state.geneticAlgorithm.population,
                    ...this.config.getConfig()
                }

                this.service.run({
                    message,
                    callbacks: {
                        error: err => reject(err),
                        [ClusterWorkerMessageType.Progress]: (message) => {
                            if (progressCallback) { progressCallback({ stageName: this.name, detail: message }) }
                        },
                        [ClusterWorkerMessageType.Result]: (result) => {
                            resolve({
                                clusterResult: { ...(state.clusterResult || {}), ...result },
                                numberOfGenerations: state.numberOfGenerations,
                                geneticAlgorithmId: state.geneticAlgorithmId
                            })
                        }
                    }
                })
            }
        })
    }
}

import { Injectable } from 'cewdi'
import { PipelineFactory } from './pipeline-factory'
import { UuidService } from './uuid-service'
import { PipelineState } from './pipeline-state'
import { PipelineProgressCallback } from './pipeline-progress-callback'
import { SharedStatePipeline } from './shared-state-pipeline'
import { PipelineResult } from './pipeline-result'

@Injectable()
export class PipelineService {
    private current?: SharedStatePipeline<PipelineState>

    constructor(private readonly factory: PipelineFactory, private readonly uuid: UuidService) {}

    async run(
        state: PipelineState,
        progressCallback: PipelineProgressCallback): Promise<PipelineResult<PipelineState>> {
        if (this.current) {
            await this.cancelCurrent()
            this.current = undefined
        }
        const checkedState = this.checkGeneticAlgorithmId(state)
        this.current = this.factory.getPipeline({ userRepresentativeRatings: checkedState.userRepresentativeRatings })
        return this.current.run(checkedState, progressCallback)
            .then(result => {
                this.current = undefined
                return result
            })
    }

    async cancelCurrent(): Promise<void> {
        if (this.current) {
            return this.current.cancel()
        }
        return
    }

    private checkGeneticAlgorithmId(state: PipelineState): PipelineState {
        if (!state.geneticAlgorithmId && state.geneticAlgorithm) {
            // Indicates that this is a new GA that needs an id.
            const newId = this.uuid.getUuid()
            return {
                ...state,
                geneticAlgorithmId: newId,
                geneticAlgorithm: { ...state.geneticAlgorithm, id: newId }
            }
        }
        return state
    }
}

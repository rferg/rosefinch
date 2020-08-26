import {
    GeneticAlgorithmOptionsRepository,
    GeneticAlgorithmOptionsStore,
    GeneticAlgorithmRepository
} from '../storage'
import { Inject, Injectable } from 'cewdi'
import { StateMediatorService, StateTopic, UpdateStateEvent } from './state'
import { globalEventTargetToken } from '../common/global-event-target-token'
import { UuidService } from './uuid-service'
import { PipelineError, PipelineProgressReport, PipelineService, PipelineState } from './pipeline'
import { SerializedGeneticAlgorithmOptions } from '../genetic-algorithm'
import { PipelineProgressEvent } from './pipeline-progress-event'
import { cancelPipelineEventType } from './cancel-pipeline-event-type'

interface RunResult {
    geneticAlgorithmId: string
    generation?: number
    error?: PipelineError<PipelineState> | Error
    isCanceled: boolean
}

@Injectable()
export class GeneticAlgorithmService {

    constructor(
        private readonly uuid: UuidService,
        private readonly pipelineService: PipelineService,
        private readonly gaRepo: GeneticAlgorithmRepository,
        private readonly optionsRepo: GeneticAlgorithmOptionsRepository,
        private readonly state: StateMediatorService,
        @Inject(globalEventTargetToken) private readonly eventTarget: EventTarget) {
            this.state.subscribe(StateTopic.GeneticAlgorithmOptions, options => this.onOptionsUpdate(options))
            this.eventTarget.addEventListener(cancelPipelineEventType, () => this.onCancel())
        }

    async createAndRun({
        size,
        genomeSize,
        numberOfGenerations,
        options
    }: {
        size: number,
        genomeSize: number,
        numberOfGenerations: number,
        options: SerializedGeneticAlgorithmOptions
    }): Promise<RunResult> {
        const id = this.uuid.getUuid()
        await this.gaRepo.add({
            storeName: 'geneticAlgorithm',
            id,
            population: { size, genomeSize },
            generation: 0
        })
        this.eventTarget.dispatchEvent(new UpdateStateEvent(
            StateTopic.GeneticAlgorithmOptions,
            {
                id,
                storeName: 'geneticAlgorithmOptions',
                ...options
            }
        ))
        return this.run({ geneticAlgorithmId: id, numberOfGenerations })
    }

    async run(options: { geneticAlgorithmId: string, numberOfGenerations: number }): Promise<RunResult> {
        try {
            const { result, error, isCanceled } = await this.pipelineService.run(
                options,
                report => this.progressCallback(report))

            if (result.representativeGenes && !isCanceled) {
                this.eventTarget.dispatchEvent(
                    new UpdateStateEvent(
                        StateTopic.RepresentativeGenes,
                        { representativeGenes: result.representativeGenes }))

                this.eventTarget.dispatchEvent(
                    new UpdateStateEvent(
                        StateTopic.UserRatings,
                        {
                            userRepresentativeRatings: new Array<number | undefined>(
                                result.representativeGenes.length)
                        }))
            }

            return {
                error,
                isCanceled,
                geneticAlgorithmId: result.geneticAlgorithmId,
                generation: result.geneticAlgorithm?.generation ?? 0
            }
        } catch (error) {
            return {
                error,
                geneticAlgorithmId: options.geneticAlgorithmId,
                isCanceled: false
            }
        }
    }

    private async onCancel(): Promise<void> {
        await this.pipelineService.cancelCurrent()
    }

    private progressCallback(report: PipelineProgressReport): void {
        this.eventTarget.dispatchEvent(new PipelineProgressEvent(report))
    }

    private async onOptionsUpdate(options: GeneticAlgorithmOptionsStore): Promise<void> {
        if (options && options.id) {
            const existing = await this.optionsRepo.get(options.id)
            if (!existing) {
                await this.optionsRepo.add(options)
            } else {
                await this.optionsRepo.put({ ...existing, ...options }, options.id)
            }
        }
    }
}

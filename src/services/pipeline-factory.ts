import { PipelineState } from './pipeline-state'
import { SharedStatePipeline } from './shared-state-pipeline'
import { PipelineStage } from './pipeline-stage'
import { Injectable } from 'cewdi'
import { ClusterResultRepository, GeneticAlgorithmRepository, GeneticAlgorithmSummaryRepository } from '../storage'
import { GeneticAlgorithmWorkerService } from './genetic-algorithm-worker-service'
import { ClusterWorkerService } from './cluster-worker-service'
import { UserRatedFitnessWorkerService } from './user-rated-fitness-worker-service'
import { GetGeneticAlgorithmStage } from './get-genetic-algorithm-stage'
import { RunGeneticAlgorithmWorkerStage } from './run-genetic-algorithm-worker-stage'
import { UpdateGeneticAlgorithmStage } from './update-genetic-algorithm-stage'
import { UpdateGeneticAlgorithmSummaryStage } from './update-genetic-algorithm-summary-stage'
import { RunClusterWorkerStage } from './run-cluster-worker-stage'
import { UpdateClusterResultStage } from './update-cluster-result-stage'
import { ClusterConfigProvider } from './cluster-config-provider'
import { GetRepresentativeGenesStage } from './get-representative-genes-stage'
import { GetClusterResultStage } from './get-cluster-result-stage'
import { RunUserRatedFitnessWorkerStage } from './run-user-rated-fitness-worker-stage'

@Injectable()
export class PipelineFactory {

    constructor(
        private readonly gaRepo: GeneticAlgorithmRepository,
        private readonly clusterRepo: ClusterResultRepository,
        private readonly gaSummaryRepo: GeneticAlgorithmSummaryRepository,
        private readonly gaWorker: GeneticAlgorithmWorkerService,
        private readonly clusterConfig: ClusterConfigProvider,
        private readonly clusterWorker: ClusterWorkerService,
        private readonly urfWorker: UserRatedFitnessWorkerService) {}

    getPipeline({
        userRepresentativeRatings
    }: {
        userRepresentativeRatings?: (number | undefined)[]
    }): SharedStatePipeline<PipelineState> {
        const stages = this.getBaseStages()
        if (this.ratingsExist(userRepresentativeRatings)) {
            stages.unshift(...this.getUserRatedFitnessStages())
        }
        return new SharedStatePipeline<PipelineState>(stages)
    }

    private ratingsExist(userRepresentativeRatings?: (number | undefined)[]): boolean {
        return !!(userRepresentativeRatings || [])
            .filter(rating => rating !== undefined)
            .length
    }

    private getUserRatedFitnessStages(): PipelineStage<PipelineState>[] {
        return [
            new GetGeneticAlgorithmStage(this.gaRepo),
            new GetClusterResultStage(this.clusterRepo),
            new RunUserRatedFitnessWorkerStage(this.urfWorker),
            new UpdateGeneticAlgorithmStage(this.gaRepo)
        ]
    }

    private getBaseStages(): PipelineStage<PipelineState>[] {
        return [
            new GetGeneticAlgorithmStage(this.gaRepo),
            new RunGeneticAlgorithmWorkerStage(this.gaWorker),
            new UpdateGeneticAlgorithmStage(this.gaRepo),
            new UpdateGeneticAlgorithmSummaryStage(this.gaSummaryRepo),
            new RunClusterWorkerStage(this.clusterWorker, this.clusterConfig),
            new UpdateClusterResultStage(this.clusterRepo),
            new GetRepresentativeGenesStage()
        ]
    }
}

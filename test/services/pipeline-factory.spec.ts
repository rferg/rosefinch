import { PipelineFactory } from '../../src/services/pipeline-factory'
import {
    ClusterResultRepository,
    GeneticAlgorithmRepository,
    GeneticAlgorithmSummaryRepository
} from '../../src/storage'
import { GeneticAlgorithmWorkerService } from '../../src/services/genetic-algorithm-worker-service'
import { ClusterConfigProvider } from '../../src/services/cluster-config-provider'
import { ClusterWorkerService } from '../../src/services/cluster-worker-service'
import { UserRatedFitnessWorkerService } from '../../src/services/user-rated-fitness-worker-service'
import { PipelineStageName } from '../../src/services/pipeline-stage-name'

describe('PipelineFactoryService', () => {
    let factory: PipelineFactory
    const baseStageNames: PipelineStageName[] = [
        PipelineStageName.GetGeneticAlgorithm,
        PipelineStageName.RunGeneticAlgorithmWorker,
        PipelineStageName.UpdateGeneticAlgorithm,
        PipelineStageName.UpdateGeneticAlgorithmSummary,
        PipelineStageName.RunClusterWorker,
        PipelineStageName.UpdateClusterResult,
        PipelineStageName.GetRepresentativeGenes
    ]
    const urfStageNames: PipelineStageName[] = [
        PipelineStageName.GetGeneticAlgorithm,
        PipelineStageName.GetClusterResult,
        PipelineStageName.RunUserRatedFitnessWorker,
        PipelineStageName.UpdateGeneticAlgorithm
    ]

    beforeEach(() => {
        factory = new PipelineFactory(
            jasmine.createSpyObj<GeneticAlgorithmRepository>('GARepo', [ 'get' ]),
            jasmine.createSpyObj<ClusterResultRepository>('CRRepo', [ 'get' ]),
            jasmine.createSpyObj<GeneticAlgorithmSummaryRepository>('GASummaryRepo', [ 'get' ]),
            jasmine.createSpyObj<GeneticAlgorithmWorkerService>('GAWorker', [ 'run' ]),
            jasmine.createSpyObj<ClusterConfigProvider>('ClusterConfigProvider', [ 'getConfig' ]),
            jasmine.createSpyObj<ClusterWorkerService>('ClusterWorker', [ 'run' ]),
            jasmine.createSpyObj<UserRatedFitnessWorkerService>('URFWorker', [ 'run' ]))
    })

    it('should return base pipeline with base stages if userRepresentativeRatings is undefined', () => {
        const pipeline = factory.getPipeline({})

        expect(pipeline.stageNames).toEqual(baseStageNames)
    })

    it('should return base stages if userRepresentativeRatings is empty', () => {
        const pipeline = factory.getPipeline({
            userRepresentativeRatings: []
        })

        expect(pipeline.stageNames).toEqual(baseStageNames)
    })

    it('should return base stages if userRepresentativeRatings only contains undefined', () => {
        const pipeline = factory.getPipeline({
            userRepresentativeRatings: [ undefined, undefined ]
        })

        expect(pipeline.stageNames).toEqual(baseStageNames)
    })

    it('should return user rated fitness stages with base stages if user rated fitness has defined value', () => {
        const pipeline = factory.getPipeline({
            userRepresentativeRatings: [ 1 ]
        })

        expect(pipeline.stageNames).toEqual([ ...urfStageNames, ...baseStageNames ])
    })
})

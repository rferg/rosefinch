import { GetRepresentativeGenesStage } from '../../../src/services/pipeline/get-representative-genes-stage'
import { PipelineState } from '../../../src/services/pipeline/pipeline-state'
import { PipelineStageName } from '../../../src/services/pipeline/pipeline-stage-name'
import { ClusterResultStore, GeneticAlgorithmStore } from '../../../src/storage'
import { SerializedPopulation } from '../../../src/genetic-algorithm'
import { RepresentativeGenesService } from '../../../src/services/pipeline'

describe('GetRepresentativeGenesStage', () => {
    let stage: GetRepresentativeGenesStage
    let serviceSpy: jasmine.SpyObj<RepresentativeGenesService>

    const state = {
        geneticAlgorithmId: '1',
        numberOfGenerations: 1,
        geneticAlgorithm: {
            population: {
                size: 1,
                genomeSize: 1,
                array: new Uint8Array(1)
            }
        },
        clusterResult: {
            representativeIndexes: [ 0 ]
        }
    } as PipelineState

    beforeEach(() => {
        serviceSpy = jasmine.createSpyObj<RepresentativeGenesService>('RepresentativeGenesService', [ 'extractGenes' ])
        stage = new GetRepresentativeGenesStage(serviceSpy)
    })

    describe('execute', () => {
        it('should call progressCallback to indicate start', () => {
            const progressSpy = jasmine.createSpy('progressCallback')

            stage.execute(state, progressSpy)

            expect(progressSpy).toHaveBeenCalledWith({
                stageName: PipelineStageName.GetRepresentativeGenes,
                detail: {
                    message: `Starting ${PipelineStageName.GetRepresentativeGenes}...`
                }
            })
        })

        it('cancel should resolve', async () => {
            await expectAsync(stage.execute(state).cancel()).toBeResolved()
        })

        it('result should reject if state is undefined', async () => {
            await expectAsync(stage.execute().result)
                .toBeRejectedWith('State is missing.')
        })

        it('result should reject if state.clusterResult is undefined', async () => {
            await expectAsync(stage.execute({ ...state, clusterResult: undefined }).result)
                .toBeRejectedWith('State is missing clusterResult.representativeIndexes.')
        })

        it('result should reject if state.clusterResult.representativeIndexes is undefined', async () => {
            await expectAsync(stage.execute({ ...state, clusterResult: {} as ClusterResultStore }).result)
                .toBeRejectedWith('State is missing clusterResult.representativeIndexes.')
        })

        it('result should reject if state.geneticAlgorithm is undefined', async () => {
            await expectAsync(stage.execute({ ...state, geneticAlgorithm: undefined }).result)
                .toBeRejectedWith('State is missing geneticAlgorithm.population.array.')
        })

        it('result should reject if state.geneticAlgorithm.population.array is undefined', async () => {
            await expectAsync(stage.execute({
                ...state,
                geneticAlgorithm: {
                    population: { size: 1, genomeSize: 1 }
                } as GeneticAlgorithmStore
            }).result).toBeRejectedWith('State is missing geneticAlgorithm.population.array.')
        })

       it('should call service.extractGenes and return result', async () => {
           const expected = [ [ 0 ] ]
           serviceSpy.extractGenes.and.returnValue(expected)

           const result = await stage.execute({ ...state }).result

           expect(serviceSpy.extractGenes)
            .toHaveBeenCalledWith(
                state.geneticAlgorithm?.population ?? {} as SerializedPopulation,
                state.clusterResult?.representativeIndexes ?? [])
            expect(result.representativeGenes).toEqual(expected)
       })
    })

    describe('rollback', () => {
        it('should resolve', async () => {
            await expectAsync(stage.rollback()).toBeResolved()
        })
    })
})

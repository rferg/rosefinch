import { GetRepresentativeGenesStage } from '../../src/services/get-representative-genes-stage'
import { PipelineState } from '../../src/services/pipeline-state'
import { PipelineStageName } from '../../src/services/pipeline-stage-name'
import { ClusterResultStore, GeneticAlgorithmStore } from '../../src/storage'
import { ClusterResult } from '../../src/clustering'
import { SerializedPopulation } from '../../src/genetic-algorithm'

describe('GetRepresentativeGenesStage', () => {
    let stage: GetRepresentativeGenesStage
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
        stage = new GetRepresentativeGenesStage()
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

        it('result should return undefined for undefined representativeIndexes', async () => {
            const { result } = stage.execute({
                ...state,
                clusterResult: { representativeIndexes: [ undefined ] } as ClusterResult
            })

            const genes = (await result).representativeGenes || []
            expect(genes.length).toBe(1)
            expect(genes[0]).toBeUndefined()
        })

        const testCases: {
            population: SerializedPopulation,
            representativeIndexes: (number | undefined)[]
            expected: (number[] | undefined)[]
        }[] = [
            {
                population: {
                    size: 3,
                    genomeSize: 3,
                    array: new Uint8Array([ 0, 0, 0, 1, 1, 1, 2, 2, 2 ])
                },
                representativeIndexes: [ 1, 0, 2 ],
                expected: [
                    [ 1, 1, 1 ],
                    [ 0, 0, 0 ],
                    [ 2, 2, 2 ]
                ]
            },
            {
                population: {
                    size: 2,
                    genomeSize: 4,
                    array: new Uint8Array([ 0, 0, 0, 0, 1, 1, 1, 1 ])
                },
                representativeIndexes: [ 0, 1 ],
                expected: [
                    [ 0, 0, 0, 0 ],
                    [ 1, 1, 1, 1 ]
                ]
            },
            {
                population: {
                    size: 3,
                    genomeSize: 4,
                    array: new Uint8Array([ 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2 ])
                },
                representativeIndexes: [ 2, 0 ],
                expected: [
                    [ 2, 2, 2, 2 ],
                    [ 0, 0, 0, 0 ]
                ]
            },
            {
                population: {
                    size: 3,
                    genomeSize: 4,
                    array: new Uint8Array([ 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2 ])
                },
                representativeIndexes: [ 2, undefined ],
                expected: [
                    [ 2, 2, 2, 2 ],
                    undefined
                ]
            }
        ]

        testCases.forEach(({ population, representativeIndexes, expected }) => {
            it(`should return ${expected} with ${representativeIndexes}`, async () => {
                const { result } = stage.execute({
                    ...state,
                    geneticAlgorithm: { population } as GeneticAlgorithmStore,
                    clusterResult: { representativeIndexes } as ClusterResultStore
                })

                const resolved = await result

                expect(resolved.representativeGenes).toEqual(expected)
            })
        })
    })

    describe('rollback', () => {
        it('should resolve', async () => {
            await expectAsync(stage.rollback()).toBeResolved()
        })
    })
})

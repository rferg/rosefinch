import { GetGeneticAlgorithmStage } from '../../src/services/pipeline/get-genetic-algorithm-stage'
import { GeneticAlgorithmRepository, GeneticAlgorithmStore } from '../../src/storage'
import { PipelineState } from '../../src/services/pipeline/pipeline-state'
import { PipelineStageName } from '../../src/services/pipeline/pipeline-stage-name'

describe('GetGeneticAlgorithmStage', () => {
    let stage: GetGeneticAlgorithmStage
    let repoSpy: jasmine.SpyObj<GeneticAlgorithmRepository>
    const state: PipelineState = {
        geneticAlgorithmId: '1',
        numberOfGenerations: 1
    }

    beforeEach(() => {
        repoSpy = jasmine.createSpyObj<GeneticAlgorithmRepository>('GeneticAlgorithmRepository', [ 'get' ])
        repoSpy.get.and.returnValue(Promise.resolve({} as GeneticAlgorithmStore))
        stage = new GetGeneticAlgorithmStage(repoSpy)
    })

    it('should have name PipelineStageName.GetGeneticAlgorithm', () => {
        expect(stage.name).toBe(PipelineStageName.GetGeneticAlgorithm)
    })

    describe('execute', () => {
        it('should call progressCallback', () => {
            const callback = jasmine.createSpy('progressCallback')
            stage.execute(state, callback)

            expect(callback).toHaveBeenCalledWith({
                stageName: PipelineStageName.GetGeneticAlgorithm,
                detail: {
                    message: 'Retrieving Genetic Algorithm...'
                }
            })
        })

        it('result should call repo.get', async () => {
            const { result } = stage.execute(state)

            await result

            expect(repoSpy.get).toHaveBeenCalledWith(state.geneticAlgorithmId)
        })

        it('result should return state with geneticAlgorithm', async () => {
            const ga = {
                id: state.geneticAlgorithmId
            } as GeneticAlgorithmStore
            repoSpy.get.and.returnValue(Promise.resolve(ga))
            const expected = { ...state, geneticAlgorithm: ga }

            const { result } = stage.execute(state)
            const returned = await result

            expect(returned).toEqual(expected)
        })

        it('result should fail if repo does not return record', async () => {
            repoSpy.get.and.returnValue(Promise.resolve(undefined))
            const { result } = stage.execute(state)

            await expectAsync(result)
                .toBeRejectedWithError(Error, `No Genetic Algorithm found with id ${state.geneticAlgorithmId}!`)
        })

        it('result should not call repo.get if geneticAlgorithm is already in state', async () => {
            const newState = { ...state, geneticAlgorithm: { id: state.geneticAlgorithmId } as GeneticAlgorithmStore }
            const { result } = stage.execute(newState)

            const returned = await result

            expect(returned).toEqual(newState)
            expect(repoSpy.get).not.toHaveBeenCalled()
        })

        it('cancel should resolve', async () => {
            const { cancel } = stage.execute(state)

            await expectAsync(cancel()).toBeResolved()
        })
    })

    describe('rollback', () => {
        it('should resolve', async () => {
            await expectAsync(stage.rollback()).toBeResolved()
        })
    })
})

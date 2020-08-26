import { GetGeneticAlgorithmStage } from '../../../src/services/pipeline/get-genetic-algorithm-stage'
import {
    GeneticAlgorithmOptionsRepository,
    GeneticAlgorithmOptionsStore,
    GeneticAlgorithmRepository,
    GeneticAlgorithmStore
} from '../../../src/storage'
import { PipelineState } from '../../../src/services/pipeline/pipeline-state'
import { PipelineStageName } from '../../../src/services/pipeline/pipeline-stage-name'

describe('GetGeneticAlgorithmStage', () => {
    let stage: GetGeneticAlgorithmStage
    let gaRepoSpy: jasmine.SpyObj<GeneticAlgorithmRepository>
    let optionsRepoSpy: jasmine.SpyObj<GeneticAlgorithmOptionsRepository>
    const state: PipelineState = {
        geneticAlgorithmId: '1',
        numberOfGenerations: 1
    }

    beforeEach(() => {
        gaRepoSpy = jasmine.createSpyObj<GeneticAlgorithmRepository>('GeneticAlgorithmRepository', [ 'get' ])
        gaRepoSpy.get.and.returnValue(Promise.resolve({} as GeneticAlgorithmStore))
        optionsRepoSpy = jasmine.createSpyObj<GeneticAlgorithmOptionsRepository>('GeneticAlgorithmOptionsRepository', [ 'get' ])
        optionsRepoSpy.get.and.returnValue(Promise.resolve({} as GeneticAlgorithmOptionsStore))
        stage = new GetGeneticAlgorithmStage(gaRepoSpy, optionsRepoSpy)
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

        it('result should call get GA and options', async () => {
            const { result } = stage.execute(state)

            await result

            expect(gaRepoSpy.get).toHaveBeenCalledWith(state.geneticAlgorithmId)
            expect(optionsRepoSpy.get).toHaveBeenCalledWith(state.geneticAlgorithmId)
        })

        it('result should return state with geneticAlgorithm and options', async () => {
            const ga = {
                id: state.geneticAlgorithmId
            } as GeneticAlgorithmStore
            const options = {
                id: state.geneticAlgorithmId
            } as GeneticAlgorithmOptionsStore
            gaRepoSpy.get.and.returnValue(Promise.resolve(ga))
            optionsRepoSpy.get.and.returnValue(Promise.resolve(options))
            const expected = { ...state, geneticAlgorithm: ga, geneticAlgorithmOptions: options }

            const { result } = stage.execute(state)
            const returned = await result

            expect(returned).toEqual(expected)
        })

        it('result should fail if repo does not return GA record', async () => {
            gaRepoSpy.get.and.returnValue(Promise.resolve(undefined))
            const { result } = stage.execute(state)

            await expectAsync(result)
                .toBeRejectedWithError(Error, `No Genetic Algorithm found with id ${state.geneticAlgorithmId}!`)
        })

        it('result should fail if repo does not return options record', async () => {
            optionsRepoSpy.get.and.returnValue(Promise.resolve(undefined))
            const { result } = stage.execute(state)

            await expectAsync(result)
                .toBeRejectedWithError(Error, `No Genetic Algorithm Options found with id ${state.geneticAlgorithmId}!`)
        })

        it('result should not call repo.get if geneticAlgorithm is already in state', async () => {
            const newState = { ...state, geneticAlgorithm: { id: state.geneticAlgorithmId } as GeneticAlgorithmStore }
            const { result } = stage.execute(newState)

            const returned = await result

            expect(returned).toEqual(newState)
            expect(gaRepoSpy.get).not.toHaveBeenCalled()
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

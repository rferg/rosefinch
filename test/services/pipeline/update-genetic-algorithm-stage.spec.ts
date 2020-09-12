import { UpdateGeneticAlgorithmStage } from '../../../src/services/pipeline/update-genetic-algorithm-stage'
import { GeneticAlgorithmRepository, GeneticAlgorithmStore } from '../../../src/storage'
import { PipelineState } from '../../../src/services/pipeline/pipeline-state'
import { PipelineStageName } from '../../../src/services/pipeline/pipeline-stage-name'

describe('UpdateGeneticAlgorithmStage', () => {
    let stage: UpdateGeneticAlgorithmStage
    let repoSpy: jasmine.SpyObj<GeneticAlgorithmRepository>
    const state: PipelineState = {
        geneticAlgorithmId: '1',
        numberOfGenerations: 1,
        geneticAlgorithm: {
            id: '1',
            generation: 1
        }
    } as PipelineState

    beforeEach(() => {
        repoSpy = jasmine.createSpyObj('GeneticAlgorithmRepository', [ 'get', 'put', 'add', 'delete' ])
        repoSpy.get.and.returnValue(Promise.resolve(undefined))
        stage = new UpdateGeneticAlgorithmStage(repoSpy)
    })

    describe('execute', () => {
        it('should call progressCallback', () => {
            const progressSpy = jasmine.createSpy('progressSpy')

            stage.execute(state, progressSpy)

            expect(progressSpy).toHaveBeenCalledWith({
                stageName: PipelineStageName.UpdateGeneticAlgorithm,
                detail: { message: 'Updating Genetic Algorithm...' }
            })
        })

        it('cancel should resolve', async () => {
            const { cancel } = stage.execute(state)

            await expectAsync(cancel()).toBeResolved()
        })

        it('result should reject if state is undefined', async () => {
            const { result } = stage.execute(undefined)

            await expectAsync(result).toBeRejectedWithError('State is missing.')
        })

        it('result should reject if state.geneticAlgorithm is undefined', async () => {
            const { result } = stage.execute({} as PipelineState)

            await expectAsync(result).toBeRejectedWithError('State is missing geneticAlgorithm.')
        })

        it('result should add genetic algorithm if repo.get returns undefined', async () => {
            const { result } = stage.execute(state)

            const resolved = await result

            expect(repoSpy.get).toHaveBeenCalledWith(state.geneticAlgorithm?.id || '')
            expect(repoSpy.add).toHaveBeenCalledWith(state.geneticAlgorithm || {} as GeneticAlgorithmStore)
            expect(resolved).toEqual(state)
        })

        it('should update genetic algorithm if repo.get returns existing record', async () => {
            const existing = { ...state.geneticAlgorithm, generation: 0 } as GeneticAlgorithmStore
            repoSpy.get.and.returnValue(Promise.resolve(existing))
            const { result } = stage.execute(state)

            const resolved = await result

            expect(repoSpy.get).toHaveBeenCalledWith(state.geneticAlgorithm?.id || '')
            expect(repoSpy.put).toHaveBeenCalledWith(
                state.geneticAlgorithm || {} as GeneticAlgorithmStore)
            expect(resolved).toEqual(state)
        })
    })

    describe('rollback', () => {
        it('should resolve immediately if not executed before', async () => {
            await expectAsync(stage.rollback(state)).toBeResolved()

            expect(repoSpy.put).not.toHaveBeenCalled()
            expect(repoSpy.get).not.toHaveBeenCalled()
            expect(repoSpy.delete).not.toHaveBeenCalled()
        })

        it('should reject if no input provided', async () => {
            await stage.execute(state).result

            await expectAsync(stage.rollback(undefined)).toBeRejectedWithError(/no input state/i)
        })

        it('should reject if no geneticAlgorithm in input provided', async () => {
            await stage.execute(state).result

            await expectAsync(stage.rollback({} as PipelineState)).toBeRejectedWithError(/missing geneticAlgorithm/i)
        })

        it('should delete record if new record was added', async () => {
            await stage.execute(state).result
            repoSpy.get.and.returnValue(Promise.resolve(state.geneticAlgorithm))

            await stage.rollback(state)

            expect(repoSpy.get).toHaveBeenCalledWith(state.geneticAlgorithm?.id ?? '')
            expect(repoSpy.delete).toHaveBeenCalledWith(state.geneticAlgorithm?.id ?? '')
        })

        it('should update record with original', async () => {
            const existing = { ...state.geneticAlgorithm, generation: 0 } as GeneticAlgorithmStore
            repoSpy.get.and.returnValue(Promise.resolve(existing))
            await stage.execute(state).result
            repoSpy.get.and.returnValue(Promise.resolve(state.geneticAlgorithm))

            await stage.rollback(state)

            expect(repoSpy.get).toHaveBeenCalledWith(state.geneticAlgorithm?.id ?? '')
            expect(repoSpy.put).toHaveBeenCalledWith(existing)
        })
    })
})

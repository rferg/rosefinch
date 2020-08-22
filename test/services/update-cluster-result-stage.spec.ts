import { UpdateClusterResultStage } from '../../src/services/update-cluster-result-stage'
import { ClusterResultRepository, ClusterResultStore } from '../../src/storage'
import { PipelineState } from '../../src/services/pipeline-state'
import { PipelineStageName } from '../../src/services/pipeline-stage-name'

describe('UpdateClusterResultStage', () => {
    let stage: UpdateClusterResultStage
    let repoSpy: jasmine.SpyObj<ClusterResultRepository>
    const clusterResult = {
        assignments: [ { clusterIndex: 0, distanceToCentroid: 0 } ],
        representativeIndexes: [ 0 ]
    }
    const state: PipelineState = {
        geneticAlgorithmId: '1',
        numberOfGenerations: 1,
        geneticAlgorithm: {
            id: '1',
            generation: 1
        },
        clusterResult
    } as PipelineState
    const clusterResultStore: ClusterResultStore = {
        ...clusterResult,
        id: state.geneticAlgorithmId,
        generation: state.geneticAlgorithm?.generation ?? 0,
        storeName: 'clusterResult'
    }

    beforeEach(() => {
        repoSpy = jasmine.createSpyObj('ClusterResultRepository', [ 'get', 'put', 'add', 'delete' ])
        repoSpy.get.and.returnValue(Promise.resolve(undefined))
        stage = new UpdateClusterResultStage(repoSpy)
    })

    describe('execute', () => {
        it('should call progressCallback', () => {
            const progressSpy = jasmine.createSpy('progressSpy')

            stage.execute(state, progressSpy)

            expect(progressSpy).toHaveBeenCalledWith({
                stageName: PipelineStageName.UpdateClusterResult,
                detail: { message: 'Updating Cluster Result...' }
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

        it('result should reject if state.clusterResult is undefined', async () => {
            const { result } = stage.execute({} as PipelineState)

            await expectAsync(result).toBeRejectedWithError('State is missing clusterResult.')
        })

        it('result should add cluster result if repo.get returns undefined', async () => {
            const { result } = stage.execute(state)

            const resolved = await result

            expect(repoSpy.get).toHaveBeenCalledWith(state.geneticAlgorithmId)
            expect(repoSpy.add).toHaveBeenCalledWith(clusterResultStore)
            expect(resolved).toEqual({ ...state, clusterResult: clusterResultStore })
        })

        it('should update cluster result if repo.get returns existing record', async () => {
            const existing = { ...clusterResultStore, generation: 0 }
            repoSpy.get.and.returnValue(Promise.resolve(existing))
            const { result } = stage.execute(state)

            const resolved = await result

            expect(repoSpy.get).toHaveBeenCalledWith(state.geneticAlgorithmId)
            expect(repoSpy.put).toHaveBeenCalledWith(clusterResultStore, state.geneticAlgorithmId)
            expect(resolved).toEqual({ ...state, clusterResult: clusterResultStore })
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

        it('should reject if no clusterResult in input provided', async () => {
            await stage.execute(state).result

            await expectAsync(stage.rollback({} as PipelineState)).toBeRejectedWithError(/missing clusterResult/i)
        })

        it('should delete record if new record was added', async () => {
            await stage.execute(state).result
            repoSpy.get.and.returnValue(Promise.resolve(clusterResultStore))

            await stage.rollback(state)

            expect(repoSpy.get).toHaveBeenCalledWith(state.geneticAlgorithmId)
            expect(repoSpy.delete).toHaveBeenCalledWith(state.geneticAlgorithmId)
        })

        it('should update record with original', async () => {
            const existing = { ...clusterResultStore, generation: 0 }
            repoSpy.get.and.returnValue(Promise.resolve(existing))
            await stage.execute(state).result
            repoSpy.get.and.returnValue(Promise.resolve(clusterResultStore))

            await stage.rollback(state)

            expect(repoSpy.get).toHaveBeenCalledWith(state.geneticAlgorithmId)
            expect(repoSpy.put).toHaveBeenCalledWith(existing, existing.id)
        })
    })
})

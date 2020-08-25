import { GetClusterResultStage } from '../../src/services/pipeline/get-cluster-result-stage'
import { ClusterResultRepository, ClusterResultStore } from '../../src/storage'
import { PipelineState } from '../../src/services/pipeline/pipeline-state'
import { PipelineStageName } from '../../src/services/pipeline/pipeline-stage-name'

describe('GetClusterResultStage', () => {
    let stage: GetClusterResultStage
    let repoSpy: jasmine.SpyObj<ClusterResultRepository>
    const state: PipelineState = {
        geneticAlgorithmId: '1',
        numberOfGenerations: 1
    }

    beforeEach(() => {
        repoSpy = jasmine.createSpyObj<ClusterResultRepository>('ClusterResultRepository', [ 'get' ])
        repoSpy.get.and.returnValue(Promise.resolve({} as ClusterResultStore))
        stage = new GetClusterResultStage(repoSpy)
    })

    it('should have name PipelineStageName.GetClusterResult', () => {
        expect(stage.name).toBe(PipelineStageName.GetClusterResult)
    })

    describe('execute', () => {
        it('should call progressCallback', () => {
            const callback = jasmine.createSpy('progressCallback')
            stage.execute(state, callback)

            expect(callback).toHaveBeenCalledWith({
                stageName: PipelineStageName.GetClusterResult,
                detail: {
                    message: 'Retrieving Cluster Result...'
                }
            })
        })

        it('result should call repo.get', async () => {
            const { result } = stage.execute(state)

            await result

            expect(repoSpy.get).toHaveBeenCalledWith(state.geneticAlgorithmId)
        })

        it('result should return state with clusterResult', async () => {
            const cr = {
                id: state.geneticAlgorithmId
            } as ClusterResultStore
            repoSpy.get.and.returnValue(Promise.resolve(cr))
            const expected = { ...state, clusterResult: cr }

            const { result } = stage.execute(state)
            const returned = await result

            expect(returned).toEqual(expected)
        })

        it('result should fail if repo does not return record', async () => {
            repoSpy.get.and.returnValue(Promise.resolve(undefined))
            const { result } = stage.execute(state)

            await expectAsync(result)
                .toBeRejectedWithError(Error, `No Cluster Result found with id ${state.geneticAlgorithmId}!`)
        })

        it('result should not call repo.get if geneticAlgorithm is already in state', async () => {
            const newState = { ...state, clusterResult: { id: state.geneticAlgorithmId } as ClusterResultStore }
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

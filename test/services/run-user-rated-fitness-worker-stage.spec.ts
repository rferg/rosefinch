import { RunUserRatedFitnessWorkerStage } from '../../src/services/run-user-rated-fitness-worker-stage'
import { UserRatedFitnessWorkerService } from '../../src/services/user-rated-fitness-worker-service'
import { PipelineState } from '../../src/services/pipeline-state'
import { PipelineStageName } from '../../src/services/pipeline-stage-name'
import { ClusterResult } from '../../src/clustering'
import { UserRatedFitnessMessage } from '../../src/user-rated-fitness'

describe('RunUserRatedFitnessWorkerStage', () => {
    let stage: RunUserRatedFitnessWorkerStage
    let serviceSpy: jasmine.SpyObj<UserRatedFitnessWorkerService>
    const state: PipelineState = {
        geneticAlgorithmId: '1',
        numberOfGenerations: 1,
        geneticAlgorithm: { fitnessValues: new Int8Array(1) },
        userRepresentativeRatings: [ 1 ],
        clusterResult: { assignments: [], representativeIndexes: [] } as ClusterResult
    } as PipelineState

    beforeEach(() => {
        serviceSpy = jasmine.createSpyObj<UserRatedFitnessWorkerService>(
            'UserRatedFitnessWorkerService',
            [ 'run', 'terminate' ])
        serviceSpy.run.and.callFake(({ message, callbacks }) => {
            callbacks.result(message.fitnessValues)
        })
        stage = new RunUserRatedFitnessWorkerStage(serviceSpy)
    })

    describe('execute', () => {
        it('should call progressCallback when starting', async () => {
            const progressSpy = jasmine.createSpy('progressCallback')

            const { result } = stage.execute(state, progressSpy)
            await result

            expect(progressSpy).toHaveBeenCalledWith({
                stageName: PipelineStageName.RunUserRatedFitnessWorker,
                detail: {
                    message: `Starting ${PipelineStageName.RunUserRatedFitnessWorker}...`
                }
            })
        })

        it('cancel should call service.terminate', async () => {
            const { cancel } = stage.execute(state)

            await cancel()

            expect(serviceSpy.terminate).toHaveBeenCalled()
        })

        it('result should reject if state is undefined', async () => {
            const { result } = stage.execute(undefined)

            await expectAsync(result).toBeRejectedWith('State is missing.')
        })

        it('result should reject if state.geneticAlgorithm is falsy', async () => {
            const { result } = stage.execute({ ...state, geneticAlgorithm: undefined })

            await expectAsync(result).toBeRejectedWith('State is missing geneticAlgorithm.')
        })

        it('result should reject if state.geneticAlgorithm.fitnessValues is falsy', async () => {
            const { result } = stage.execute({
                ...state,
                geneticAlgorithm: { ...state.geneticAlgorithm, fitnessValues: undefined }
            } as PipelineState)

            await expectAsync(result).toBeRejectedWith('State is missing fitnessValues.')
        })

        it('result should reject if state.clusterResult is falsy', async () => {
            const { result } = stage.execute({
                ...state,
                clusterResult: undefined
            } as PipelineState)

            await expectAsync(result).toBeRejectedWith('State is missing clusterResult.')
        })

        it('result should not call service.run if userRepresentativeRatings is empty', async () => {
            const { result } = stage.execute({
                ...state,
                userRepresentativeRatings: []
            } as PipelineState)

            await result

            expect(serviceSpy.run).not.toHaveBeenCalled()
        })

        it('result should call service.run and resolve to state with updated fitnessValues', async () => {
            const expectedFitnessValues = new Int8Array([ 3 ])
            let calledMessage: UserRatedFitnessMessage | undefined
            serviceSpy.run.and.callFake(({ message, callbacks }) => {
                calledMessage = message
                callbacks.result(expectedFitnessValues)
            })

            const { result } = stage.execute(state)
            const resolved = await result

            expect(resolved.geneticAlgorithm?.fitnessValues).toEqual(expectedFitnessValues)
            expect(calledMessage?.clusterResult).toEqual(state.clusterResult)
            expect(calledMessage?.userRepresentativeRatings).toEqual(state.userRepresentativeRatings)
        })

        it('result should call service.run with error callback that rejects', async () => {
            const expectedError = new ErrorEvent('Test Error')
            serviceSpy.run.and.callFake(({ callbacks }) => {
                callbacks.error(expectedError)
            })

            const { result } = stage.execute(state)

            await expectAsync(result).toBeRejectedWith(expectedError)
        })
    })

    describe('rollback', () => {
        it('should resolve', async () => {
            await expectAsync(stage.rollback()).toBeResolved()
        })
    })
})

import { RunClusterWorkerStage } from '../../src/services/run-cluster-worker-stage'
import { ClusterWorkerService } from '../../src/services/cluster-worker-service'
import { ClusterConfigProvider } from '../../src/services/cluster-config-provider'
import { PipelineState } from '../../src/services/pipeline-state'
import { ClusterMessage, ClusterProgressMessage, ClusterResult, ClusterWorkerMessageType } from '../../src/clustering'
import { PipelineStageName } from '../../src/services/pipeline-stage-name'
import { ClusterConfig } from '../../src/services/cluster-config'

describe('RunClusterWorkerStage', () => {
    let stage: RunClusterWorkerStage
    let serviceSpy: jasmine.SpyObj<ClusterWorkerService>
    let configSpy: jasmine.SpyObj<ClusterConfigProvider>

    const state = {
        geneticAlgorithmId: '1',
        numberOfGenerations: 1,
        geneticAlgorithm: { population: { size: 1, genomeSize: 1, array: new Uint8Array(1) } }
    } as PipelineState

    beforeEach(() => {
        serviceSpy = jasmine.createSpyObj<ClusterWorkerService>(
            'ClusterWorkerService',
            [ 'run', 'terminate' ])
        serviceSpy.run.and.callFake(({ callbacks }) => {
            callbacks[ClusterWorkerMessageType.Result]({
                assignments: [ { clusterIndex: 0, distanceToCentroid: 0 } ], representativeIndexes: [ 0 ]
            })
        })
        configSpy = jasmine.createSpyObj<ClusterConfigProvider>(
            'ClusterConfigProvider',
            [ 'getConfig' ]
        )
        configSpy.getConfig.and.returnValue({
            maxIterations: 1,
            stopThreshold: 1,
            numberOfRepresentatives: 1
        })
        stage = new RunClusterWorkerStage(serviceSpy, configSpy)
    })

    describe('execute', () => {
        it('should call progressCallback when starting', async () => {
            const progressSpy = jasmine.createSpy('progressCallback')

            const { result } = stage.execute(state, progressSpy)
            await result

            expect(progressSpy).toHaveBeenCalledWith({
                stageName: PipelineStageName.RunClusterWorker,
                detail: {
                    message: `Starting ${PipelineStageName.RunClusterWorker}...`
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

        it('result should reject if state.geneticAlgorithm.population is falsy', async () => {
            const { result } = stage.execute({ ...state, geneticAlgorithm: { } } as PipelineState)

            await expectAsync(result).toBeRejectedWith('State is missing geneticAlgorithm.population.')
        })

        it('result should call service.run and resolve to state with clusterResult', async () => {
            const config: ClusterConfig = {
                maxIterations: 123,
                stopThreshold: 2,
                numberOfRepresentatives: 20
            }
            configSpy.getConfig.and.returnValue(config)
            const expected: ClusterResult = {
                assignments: [ { clusterIndex: 1, distanceToCentroid: 2 } ],
                representativeIndexes: [ 1 ]
            }
            let calledMessage: ClusterMessage | undefined
            serviceSpy.run.and.callFake(({ message, callbacks }) => {
                calledMessage = message
                callbacks[ClusterWorkerMessageType.Result](expected)
            })

            const { result } = stage.execute({ ...state })
            const resolved = await result

            expect(resolved.clusterResult).toEqual(expected)
            expect(calledMessage?.population).toEqual(state.geneticAlgorithm?.population)
            expect(calledMessage?.maxIterations).toEqual(config.maxIterations)
            expect(calledMessage?.stopThreshold).toEqual(config.stopThreshold)
            expect(calledMessage?.numberOfRepresentatives).toEqual(config.numberOfRepresentatives)
        })

        it('result should call service.run with error callback that rejects', async () => {
            const expectedError = new ErrorEvent('Test Error')
            serviceSpy.run.and.callFake(({ callbacks }) => {
                callbacks.error(expectedError)
            })

            const { result } = stage.execute(state)

            await expectAsync(result).toBeRejectedWith(expectedError)
        })

        it('result should call service.run with progress callback that calls passed progressCallback', async () => {
            const progressSpy = jasmine.createSpy('progressCallback')
            const progressMessage: ClusterProgressMessage = {
                type: ClusterWorkerMessageType.Progress,
                iteration: 5
            }
            serviceSpy.run.and.callFake(({ callbacks }) => {
                const progressCallback = callbacks[ClusterWorkerMessageType.Progress]
                if (progressCallback) {
                    progressCallback(progressMessage)
                }
                callbacks[ClusterWorkerMessageType.Result]({} as ClusterResult)
            })

            const { result } = stage.execute(state, progressSpy)
            await result

            expect(progressSpy).toHaveBeenCalledWith({
                stageName: PipelineStageName.RunClusterWorker,
                detail: progressMessage
            })
        })
    })

    describe('rollback', () => {
        it('should resolve', async () => {
            await expectAsync(stage.rollback()).toBeResolved()
        })
    })
})

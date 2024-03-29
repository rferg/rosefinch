import { RunGeneticAlgorithmWorkerStage } from '../../../src/services/pipeline/run-genetic-algorithm-worker-stage'
import { GeneticAlgorithmWorkerService } from '../../../src/services/pipeline/genetic-algorithm-worker-service'
import { PipelineState } from '../../../src/services/pipeline/pipeline-state'
import {
    CrossoverMethod,
    FitnessMethod,
    GeneticAlgorithmWorkerMessageType,
    MutationMethod,
    ProgressMessage,
    ResultMessage,
    RunMessage,
    SelectionMethod,
    SerializedGeneticAlgorithm
} from '../../../src/genetic-algorithm'
import { PipelineStageName } from '../../../src/services/pipeline/pipeline-stage-name'
import { GeneticAlgorithmStore } from '../../../src/storage'

describe('RunGeneticAlgorithmWorkerStage', () => {
    let stage: RunGeneticAlgorithmWorkerStage
    let serviceSpy: jasmine.SpyObj<GeneticAlgorithmWorkerService>
    const state: PipelineState = {
        geneticAlgorithmId: '1',
        numberOfGenerations: 1,
        geneticAlgorithm: {
            population: { size: 1, genomeSize: 1 },
            id: '1',
            generation: 0,
            storeName: 'geneticAlgorithm'
        },
        geneticAlgorithmOptions: {
            id: '1',
            storeName: 'geneticAlgorithmOptions',
            geneFactoryOptions: {
                excludedPitches: [],
                octaveRange: [ 1, 1 ]
            },
            fitnessConfigs: [
                {
                    method: FitnessMethod.RestProportion,
                    options: { targetProportion: 0.1 }
                }
            ],
            crossoverMethod: CrossoverMethod.HybridPoint,
            mutationConfig: { mutationRate: 1, method: MutationMethod.Point },
            selectionConfig: { method: SelectionMethod.Tournament },
            timeSignature: [ 1, 1 ],
            shortestNoteDuration: 1,
            measures: 1
        }
    }

    beforeEach(() => {
        serviceSpy = jasmine.createSpyObj<GeneticAlgorithmWorkerService>(
            'GeneticAlgorithmWorkerService',
            [ 'run' ])
        serviceSpy.run.and.callFake(({ callbacks }) => {
            callbacks[GeneticAlgorithmWorkerMessageType.Results]({ } as ResultMessage)
        })
        stage = new RunGeneticAlgorithmWorkerStage(serviceSpy)
    })

    describe('execute', () => {
        it('should call progressCallback when starting', async () => {
            const progressSpy = jasmine.createSpy('progressCallback')

            const { result } = stage.execute(state, progressSpy)
            await result

            expect(progressSpy).toHaveBeenCalledWith({
                stageName: PipelineStageName.RunGeneticAlgorithmWorker,
                detail: {
                    message: `Starting ${PipelineStageName.RunGeneticAlgorithmWorker}...`
                }
            })
        })

        it('result should reject if state is undefined', async () => {
            const { result } = stage.execute(undefined)

            await expectAsync(result).toBeRejectedWith('State is missing.')
        })

        it('result should reject if state.geneticAlgorithm is falsy', async () => {
            const { result } = stage.execute({ ...state, geneticAlgorithm: undefined })

            await expectAsync(result).toBeRejectedWith('State is missing geneticAlgorithm.')
        })

        it('result should reject if state.geneticAlgorithmOptions is falsy', async () => {
            const { result } = stage.execute({ ...state, geneticAlgorithmOptions: undefined })

            await expectAsync(result).toBeRejectedWith('State is missing geneticAlgorithmOptions.')
        })

        it('result should call service.run and resolve to state with updated geneticAlgorithm values', async () => {
            const expected: ResultMessage = {
                type: GeneticAlgorithmWorkerMessageType.Results,
                generation: 1,
                fitnessValues: new Int8Array([ 3 ]),
                population: {
                    size: 1,
                    genomeSize: 1,
                    array: new Uint8Array(1)
                }
            }
            let calledMessage: RunMessage | undefined
            serviceSpy.run.and.callFake(({ message, callbacks }) => {
                calledMessage = message
                callbacks[GeneticAlgorithmWorkerMessageType.Results](expected)
            })

            const { result } = stage.execute({ ...state })
            const resolved = await result

            expect(resolved.geneticAlgorithm).toEqual({
                ...state.geneticAlgorithm,
                population: expected.population,
                fitnessValues: expected.fitnessValues,
                generation: expected.generation
            } as GeneticAlgorithmStore)
            expect(calledMessage?.geneticAlgorithm).toEqual({
                ...state.geneticAlgorithm,
                options: state.geneticAlgorithmOptions,
                kind: 'SerializedGeneticAlgorithm'
            } as SerializedGeneticAlgorithm)
            expect(calledMessage?.numberOfGenerations).toEqual(state.numberOfGenerations)
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
            const progressMessage: ProgressMessage = {
                type: GeneticAlgorithmWorkerMessageType.Progress,
                percentComplete: 5
            }
            serviceSpy.run.and.callFake(({ callbacks }) => {
                callbacks[GeneticAlgorithmWorkerMessageType.Progress](progressMessage)
                callbacks[GeneticAlgorithmWorkerMessageType.Results]({} as ResultMessage)
            })

            const { result } = stage.execute(state, progressSpy)
            await result

            expect(progressSpy).toHaveBeenCalledWith({
                stageName: PipelineStageName.RunGeneticAlgorithmWorker,
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

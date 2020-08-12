import { GeneticAlgorithmWorker } from '../../src/genetic-algorithm/genetic-algorithm-worker'
import { messageHandler } from '../../src/genetic-algorithm/message-handler'
import { CrossoverMethod, MutationMethod, Population, RunData, SelectionMethod, SerializedGeneticAlgorithm } from '../../src/genetic-algorithm'
import { ResultMessage } from '../../src/genetic-algorithm/result-message'
import { GeneticAlgorithmWorkerMessageType } from '../../src/genetic-algorithm/genetic-algorithm-worker-message-type'
import { ProgressMessage } from '../../src/genetic-algorithm/progress-message'

describe('messageHandler', () => {
    let postMessageSpy: jasmine.Spy<(message: any, targetOrigin: string, transfer?: Transferable[]) => void>
    let workerSpy: jasmine.SpyObj<GeneticAlgorithmWorker>

    beforeEach(() => {
        postMessageSpy = jasmine.createSpy('postMessage')
        workerSpy = jasmine.createSpyObj<GeneticAlgorithmWorker>('GeneticAlgorithmWorker', [ 'execute' ])
        workerSpy.execute.and.returnValue({
            generation: 0,
            population: new Population({ size: 1, genomeSize: 1 }),
            fitnessValues: new Int8Array(1)
        })
    })

    it('should throw if data are falsy', () => {
        expect(() => messageHandler({ data: null } as MessageEvent, postMessageSpy, workerSpy))
            .toThrowError(/does not contain positive numberOfGenerations/i)
    })

    it('should throw if data.numberOfGenerations is 0', () => {
        expect(() => messageHandler({ data: { numberOfGenerations: 0 } } as MessageEvent, postMessageSpy, workerSpy))
            .toThrowError(/does not contain positive numberOfGenerations/i)
    })

    it('should throw if data.geneticAlgorithm is undefined', () => {
        expect(() => messageHandler({ data: { numberOfGenerations: 1 } } as MessageEvent, postMessageSpy, workerSpy))
            .toThrowError(/is not a SerializedGeneticAlgorithm/i)
    })

    it('should throw if data.geneticAlgorithm is not a SerializedGeneticAlgorithm', () => {
        expect(() => messageHandler({
                data: {
                    numberOfGenerations: 1,
                    geneticAlgorithm: { prop: 1 }
                }
            } as MessageEvent,
            postMessageSpy,
            workerSpy)).toThrowError(/is not a SerializedGeneticAlgorithm/)
    })

    const geneticAlgorithm: SerializedGeneticAlgorithm = {
        kind: 'SerializedGeneticAlgorithm',
        id: '',
        population: { size: 1, genomeSize: 1, array: new Uint8Array(1) },
        fitnessValues: new Int8Array(1),
        fitnessConfigs: [],
        mutationConfig: { method: MutationMethod.Point, mutationRate: 0.1 },
        crossoverMethod: CrossoverMethod.HybridPoint,
        selectionConfig: { method: SelectionMethod.Tournament },
        generation: 0,
        geneFactoryOptions: { octaveRange: [ 1, 1 ], excludedPitches: [] }
    }
    const numberOfGenerations = 5

    it('should call worker.execute with data.geneticAlgorithm, data.numberOfGenerations, and progressReporter', () => {
        messageHandler({ data: { numberOfGenerations, geneticAlgorithm } } as MessageEvent, postMessageSpy, workerSpy)

        expect(workerSpy.execute).toHaveBeenCalledWith(geneticAlgorithm, numberOfGenerations, jasmine.any(Function))
    })

    it('should postMessage with execute result', () => {
        const runData: RunData = {
            generation: numberOfGenerations,
            population: new Population(geneticAlgorithm.population),
            fitnessValues: new Int8Array(1)
        }
        workerSpy.execute.and.returnValue(runData)
        messageHandler({ data: { numberOfGenerations, geneticAlgorithm } } as MessageEvent, postMessageSpy, workerSpy)

        expect(postMessageSpy).toHaveBeenCalledWith({
            type: GeneticAlgorithmWorkerMessageType.Results,
            generation: runData.generation,
            fitnessValues: runData.fitnessValues,
            population: runData.population.serialize()
        } as ResultMessage, '*')
    })

    it('should create progressReporter that postsMessage only on whole number percentage progress', () => {
        messageHandler({ data: { numberOfGenerations, geneticAlgorithm } } as MessageEvent, postMessageSpy, workerSpy)
        const progressReporter = workerSpy.execute.calls.mostRecent().args[2]

        progressReporter({
            startingGeneration: 0,
            currentGeneration: 1,
            endingGeneration: 3
        })
        progressReporter({
            startingGeneration: 0,
            currentGeneration: 1,
            endingGeneration: 4
        })
        progressReporter({
            startingGeneration: 1,
            currentGeneration: 2,
            endingGeneration: 11
        })

        expect(postMessageSpy).toHaveBeenCalledWith({
            type: GeneticAlgorithmWorkerMessageType.Progress,
            percentComplete: 25
        } as ProgressMessage, '*')
        expect(postMessageSpy).toHaveBeenCalledWith({
            type: GeneticAlgorithmWorkerMessageType.Progress,
            percentComplete: 10
        } as ProgressMessage, '*')
        expect(postMessageSpy).not.toHaveBeenCalledWith({
            type: GeneticAlgorithmWorkerMessageType.Progress,
            percentComplete: (1 / 3) * 100
        } as ProgressMessage, '*')
    })
})

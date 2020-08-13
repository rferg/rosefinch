import {
    CrossoverMethod,
    FitnessMethod,
    GeneticAlgorithmWorkerMessageType,
    MutationMethod,
    ProgressMessage,
    ResultMessage,
    RunMessage,
    SelectionMethod
} from './genetic-algorithm'
import { Pitch } from './common/pitch'

const gaWorker = new Worker('./genetic-algorithm/worker.ts')

gaWorker.addEventListener('message', ({ data }: MessageEvent) => {
    if (isProgressMessage(data)) {
        handleProgressMessage(data)
    } else if (isResultMessage(data)) {
        handleResultMessage(data)
    } else {
        throw new Error(`Received invalid message ${data} from genetic algorithm worker!`)
    }
})

gaWorker.addEventListener('error', error => {
    console.error(`Received worker error: ${error}`)
})

gaWorker.addEventListener('messageerror', error => {
    console.log(`Received message error: ${error}`)
})

runGeneticAlgorithm(gaWorker)

function isProgressMessage(data: any): data is ProgressMessage {
    return (data as ProgressMessage)?.type === GeneticAlgorithmWorkerMessageType.Progress
}

function isResultMessage(data: any): data is ResultMessage {
    return (data as ResultMessage)?.type === GeneticAlgorithmWorkerMessageType.Results
}

function handleProgressMessage({ percentComplete }: ProgressMessage): void {
    console.log(`Progress: ${percentComplete}% complete.`)
}

function handleResultMessage({ generation }: ResultMessage): void {
    console.log(`Got results for generation ${generation}.`)
}

function runGeneticAlgorithm(worker: Worker) {
    const message: RunMessage = {
        numberOfGenerations: 100,
        geneticAlgorithm: {
            kind: 'SerializedGeneticAlgorithm',
            id: 'ga-1',
            generation: 0,
            geneFactoryOptions: {
                octaveRange: [ 3, 5 ],
                excludedPitches: []
            },
            population: { size: 1000, genomeSize: 256 },
            fitnessConfigs: [
                {
                    method: FitnessMethod.ChordFit,
                    options: { chords: { 0: [ Pitch.C, Pitch.E, Pitch.F ], 4: [ Pitch.D, Pitch.F ] } }
                },
                {
                    method: FitnessMethod.ScaleInterval,
                    options: {
                        scale: [ Pitch.C, Pitch.D, Pitch.E, Pitch.F, Pitch.G, Pitch.A, Pitch.B ],
                        intervalScores: [ 9, 10, 10, 8, 5, 2, 1 ]
                    }
                },
                {
                    method: FitnessMethod.RestProportion,
                    options: { targetProportion: 0.25 }
                },
                {
                    method: FitnessMethod.RhythmicDispersion,
                    options: { target: 2 }
                },
                {
                    method: FitnessMethod.PitchSequenceDirection,
                    options: { sequenceLength: 3, scores: { ascending: 2, stable: 1, descending: 2 } }
                }
            ],
            crossoverMethod: CrossoverMethod.HybridPoint,
            mutationConfig: { method: MutationMethod.Point, mutationRate: 0.1 },
            selectionConfig: { method: SelectionMethod.Tournament }
        }
    }

    console.log('Sending run message...')

    worker.postMessage(message)
}

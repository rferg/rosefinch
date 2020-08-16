import {
    CrossoverMethod,
    FitnessMethod,
    GeneticAlgorithmWorkerMessageType,
    MutationMethod,
    ProgressMessage,
    ResultMessage,
    RunMessage,
    SelectionMethod,
    SerializedPopulation
} from './genetic-algorithm'
import { Pitch } from './common/pitch'
import { ClusterProgressMessage, ClusterResultMessage, ClusterWorkerMessageType } from './clustering'
import { ClusterMessage } from './clustering/cluster-message'

const gaWorker = new Worker('./genetic-algorithm/worker.ts')
const clusterWorker = new Worker('./clustering/worker.ts')

gaWorker.addEventListener('message', ({ data }: MessageEvent) => {
    if (isGAProgressMessage(data)) {
        handleGAProgressMessage(data)
    } else if (isGAResultMessage(data)) {
        handleGAResultMessage(data)
    } else {
        throw new Error(`Received invalid message ${data} from genetic algorithm worker!`)
    }
})

gaWorker.addEventListener('error', error => {
    console.error(`Received GA worker error: ${error}`)
})

gaWorker.addEventListener('messageerror', error => {
    console.log(`Received GA message error: ${error}`)
})

clusterWorker.addEventListener('message', ({ data }: MessageEvent) => {
    if (isClusterProgressMessage(data)) {
        handleClusterProgressMessage(data)
    } else if (isClusterResultMessage(data)) {
        handleClusterResultMessage(data)
    } else {
        throw new Error(`Invalid message ${data} received from Cluster Worker.`)
    }
})

clusterWorker.addEventListener('error', error => {
    console.error(`Received Cluster worker error: ${error}`)
})

clusterWorker.addEventListener('messageerror', error => {
    console.log(`Received Cluster message error: ${error}`)
})

runGeneticAlgorithm(gaWorker)

function isGAProgressMessage(data: any): data is ProgressMessage {
    return (data as ProgressMessage)?.type === GeneticAlgorithmWorkerMessageType.Progress
}

function isGAResultMessage(data: any): data is ResultMessage {
    return (data as ResultMessage)?.type === GeneticAlgorithmWorkerMessageType.Results
}

function isClusterProgressMessage(data: any): data is ClusterProgressMessage {
    return (data as ClusterProgressMessage)?.type === ClusterWorkerMessageType.Progress
}

function isClusterResultMessage(data: any): data is ClusterResultMessage {
    return (data as ClusterResultMessage)?.type === ClusterWorkerMessageType.Result
}

function sendClusterMessage(population: SerializedPopulation): void {
    const message: ClusterMessage = {
        kind: 'ClusterMessage',
        population,
        numberOfRepresentatives: 10,
        maxIterations: 1000,
        stopThreshold: 1
    }

    clusterWorker.postMessage(message)
}

function handleGAProgressMessage({ percentComplete }: ProgressMessage): void {
    console.log(`GA Progress: ${percentComplete}% complete.`)
}

function handleGAResultMessage({ generation, population }: ResultMessage): void {
    console.log(`Got results for generation ${generation}.`)
    console.log('Sending clustering message...')
    sendClusterMessage(population)
}

function handleClusterProgressMessage({ iteration }: ClusterProgressMessage): void {
    console.log(`Clustering iteration ${iteration}`)
}

function handleClusterResultMessage({ result }: ClusterResultMessage): void {
    console.log(`Got results from Clustering ${result.representativeIndexes}`)
    result.representativeIndexes.forEach(repIdx =>
        console.log(result.assignments[repIdx].clusterIndex, result.assignments[repIdx].distanceToCentroid))
    const assignmentCounts = result.assignments.reduce((prev, { clusterIndex }) => {
        if (!prev[clusterIndex]) {
            prev[clusterIndex] = 0
        }
        prev[clusterIndex]++
        return prev
    }, {} as { [key: number]: number })
    console.log(assignmentCounts)
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
            population: { size: 5000, genomeSize: 128 },
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
                    options: { target: 1 }
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

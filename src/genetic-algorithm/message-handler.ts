import { GeneticAlgorithmWorker } from './genetic-algorithm-worker'
import { SerializedGeneticAlgorithm } from './serialized-genetic-algorithm'
import { RunnerProgressReporter } from './runner-progress-reporter'
import { RunnerProgressReport } from './runner-progress-report'
import { ProgressMessage } from './progress-message'
import { GeneticAlgorithmWorkerMessageType } from './genetic-algorithm-worker-message-type'
import { ResultMessage } from './result-message'
import { RunMessage } from './run-message'

type MessagePoster = (message: any, targetOrigin: string, transfer?: Transferable[]) => void

export function messageHandler(
    { data }: MessageEvent,
    postMessage: MessagePoster,
    geneticAlgorithmWorker: GeneticAlgorithmWorker) {

        validateMessageData(data)

        const { geneticAlgorithm, numberOfGenerations } = data as RunMessage

        const progressReporter = progressReporterFactory(postMessage)

        const { generation, population, fitnessValues } = geneticAlgorithmWorker
            .execute(geneticAlgorithm, numberOfGenerations, progressReporter)
        const message: ResultMessage = {
            type: GeneticAlgorithmWorkerMessageType.Results,
            generation,
            fitnessValues,
            population: population.serialize()
        }
        postMessage(message, '*')
}

function progressReporterFactory(postMessage: MessagePoster): RunnerProgressReporter {
    return ({
        startingGeneration,
        currentGeneration,
        endingGeneration
    }: RunnerProgressReport) => {
        const percentComplete = ((currentGeneration - startingGeneration)
            / (endingGeneration - startingGeneration)) * 100
        // Only send messages on whole-number percentage so we limit
        // the number of messages sent.
        if (!(percentComplete % 1)) {
            const message: ProgressMessage = {
                type: GeneticAlgorithmWorkerMessageType.Progress,
                percentComplete
            }
            postMessage(message, '*')
        }
    }
}

function validateMessageData(data: any): void {
    if (!data?.numberOfGenerations) {
        throw new Error(`Message data ${data} does not contain positive numberOfGenerations.`)
    }

    if (!isSerializedGeneticAlgorithm(data.geneticAlgorithm)) {
        throw new Error(
            `Message data.geneticAlgorithm ${data.geneticAlgorithm} is not a SerializedGeneticAlgorithm.`)
    }
}

function isSerializedGeneticAlgorithm(x: any): x is SerializedGeneticAlgorithm {
    return (x as SerializedGeneticAlgorithm)?.kind === 'SerializedGeneticAlgorithm'
}

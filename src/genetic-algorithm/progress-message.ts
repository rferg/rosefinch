import { GeneticAlgorithmWorkerMessageType } from './genetic-algorithm-worker-message-type'

export interface ProgressMessage {
    type: GeneticAlgorithmWorkerMessageType.Progress,
    percentComplete: number
}

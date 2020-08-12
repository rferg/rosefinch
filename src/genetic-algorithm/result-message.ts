import { GeneticAlgorithmWorkerMessageType } from './genetic-algorithm-worker-message-type'
import { SerializedPopulation } from './serialized-population'

export interface ResultMessage {
    type: GeneticAlgorithmWorkerMessageType.Results,
    generation: number,
    fitnessValues: Int8Array
    population: SerializedPopulation
}

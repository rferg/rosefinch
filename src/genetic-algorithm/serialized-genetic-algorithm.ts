import { SerializedPopulation } from './serialized-population'
import { SerializedGeneticAlgorithmOptions } from './serialized-genetic-algorithm-options'

export interface SerializedGeneticAlgorithm extends SerializedGeneticAlgorithmOptions {
    kind: 'SerializedGeneticAlgorithm'
    id: string
    generation: number
    population: SerializedPopulation
    fitnessValues?: Int8Array
}

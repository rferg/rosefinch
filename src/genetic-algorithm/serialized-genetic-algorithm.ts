import { SerializedPopulation } from './serialized-population'
import { SerializedGeneticAlgorithmOptions } from './serialized-genetic-algorithm-options'

export interface SerializedGeneticAlgorithm {
    kind: 'SerializedGeneticAlgorithm'
    id: string
    generation: number
    population: SerializedPopulation
    fitnessValues?: Int8Array
    options: SerializedGeneticAlgorithmOptions
}

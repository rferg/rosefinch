import { SerializedGeneticAlgorithm } from './serialized-genetic-algorithm'

export interface RunMessage {
    geneticAlgorithm: SerializedGeneticAlgorithm,
    numberOfGenerations: number
}

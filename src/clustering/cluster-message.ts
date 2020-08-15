import { SerializedPopulation } from '../genetic-algorithm'

export interface ClusterMessage {
    kind: 'ClusterMessage'
    population: SerializedPopulation
    numberOfRepresentatives: number
    maxIterations: number
    stopThreshold: number
}

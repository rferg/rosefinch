import { SerializedPopulation } from '../genetic-algorithm'

export interface ClusterMessage {
    population: SerializedPopulation
    octaveRange: [ number, number ]
    maxIterations: number,
    stopThreshold: number
}

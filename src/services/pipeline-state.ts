import { ClusterResultStore, GeneticAlgorithmStore } from '../storage'
import { ClusterResult } from '../clustering'

export interface PipelineState {
    geneticAlgorithmId: string
    numberOfGenerations: number
    userRepresentativeRatings?: number[]
    geneticAlgorithm?: GeneticAlgorithmStore
    clusterResult?: ClusterResultStore | ClusterResult
    representativeGenes?: number[][]
}

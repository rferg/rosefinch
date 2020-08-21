import { ClusterResultStore, GeneticAlgorithmStore } from '../storage'

export interface PipelineState {
    geneticAlgorithmId: string
    numberOfGenerations: number
    userRepresentativeRatings?: number[]
    geneticAlgorithm?: GeneticAlgorithmStore
    clusterResult?: ClusterResultStore
    representativeGenes?: number[][]
}

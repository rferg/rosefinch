import { ClusterResultStore, GeneticAlgorithmOptionsStore, GeneticAlgorithmStore } from '../../storage'
import { ClusterResult } from '../../clustering'

export interface PipelineState {
    geneticAlgorithmId: string
    numberOfGenerations: number
    userRepresentativeRatings?: (number | undefined)[]
    geneticAlgorithm?: GeneticAlgorithmStore
    geneticAlgorithmOptions?: GeneticAlgorithmOptionsStore
    clusterResult?: ClusterResultStore | ClusterResult
    representativeGenes?: (number[] | undefined)[]
}

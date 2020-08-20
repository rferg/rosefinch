import { DBSchema } from 'idb'
import { GeneticAlgorithmStore } from './genetic-algorithm-store'
import { OptionsTemplateStore } from './options-template-store'
import { GeneticAlgorithmSummaryStore } from './genetic-algorithm-summary-store'
import { ClusterResultStore } from './cluster-result-store'

export interface Schema extends DBSchema {
    geneticAlgorithm: {
        key: string,
        value: GeneticAlgorithmStore
    }
    geneticAlgorithmSummary: {
        key: string,
        value: GeneticAlgorithmSummaryStore
        indexes: { 'by-lastRunOn': Date }
    }
    optionsTemplate: {
        key: string,
        value: OptionsTemplateStore
    }
    clusterResult: {
        key: string,
        value: ClusterResultStore
    }
}

import { DBSchema } from 'idb'
import { GeneticAlgorithmStore } from './genetic-algorithm-store'
import { OptionsTemplateStore } from './options-template-store'
import { GeneticAlgorithmSummaryStore } from './genetic-algorithm-summary-store'
import { ClusterResultStore } from './cluster-result-store'
import { GeneticAlgorithmOptionsStore } from './genetic-algorithm-options-store'

export interface Schema extends DBSchema {
    geneticAlgorithm: {
        key: string,
        value: GeneticAlgorithmStore
    }
    geneticAlgorithmOptions: {
        key: string,
        value: GeneticAlgorithmOptionsStore
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

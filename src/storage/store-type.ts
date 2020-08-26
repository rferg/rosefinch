import { GeneticAlgorithmStore } from './genetic-algorithm-store'
import { OptionsTemplateStore } from './options-template-store'
import { GeneticAlgorithmSummaryStore } from './genetic-algorithm-summary-store'
import { ClusterResultStore } from './cluster-result-store'
import { GeneticAlgorithmOptionsStore } from './genetic-algorithm-options-store'

export type StoreType = GeneticAlgorithmStore
    | OptionsTemplateStore
    | GeneticAlgorithmSummaryStore
    | ClusterResultStore
    | GeneticAlgorithmOptionsStore

import { Store } from './store'

export interface GeneticAlgorithmSummaryStore extends Store {
    storeName: 'geneticAlgorithmSummary'
    geneticAlgorithmId: string
    name: string
    createdOn: Date
    lastRunOn: Date
}

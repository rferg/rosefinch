import { Store } from './store'

export interface GeneticAlgorithmSummaryStore extends Store {
    storeName: 'geneticAlgorithmSummary'
    geneticAlgorithmId: string
    generation: number
    name: string
    createdOn: Date
    lastRunOn: Date
}

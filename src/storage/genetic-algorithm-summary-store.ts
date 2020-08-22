import { Store } from './store'

export interface GeneticAlgorithmSummaryStore extends Store {
    storeName: 'geneticAlgorithmSummary'
    generation: number
    lastRunOn: Date
}

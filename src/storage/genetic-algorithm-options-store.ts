import { Store } from './store'
import { SerializedGeneticAlgorithmOptions } from '../genetic-algorithm'

export interface GeneticAlgorithmOptionsStore extends Store, SerializedGeneticAlgorithmOptions {
    storeName: 'geneticAlgorithmOptions'
}

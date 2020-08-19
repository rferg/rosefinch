import { SerializedGeneticAlgorithm } from '../genetic-algorithm'
import { Store } from './store'

export interface GeneticAlgorithmStore extends SerializedGeneticAlgorithm, Store {
    storeName: 'geneticAlgorithm'
}

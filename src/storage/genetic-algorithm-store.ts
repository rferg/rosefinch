import { SerializedPopulation } from '../genetic-algorithm'
import { Store } from './store'

export interface GeneticAlgorithmStore extends Store {
    storeName: 'geneticAlgorithm'
    id: string
    generation: number
    population: SerializedPopulation
    fitnessValues?: Int8Array
}

import { Store } from './store'
import { SerializedGeneticAlgorithmOptions } from '../genetic-algorithm'

export interface OptionsTemplateStore extends Store, SerializedGeneticAlgorithmOptions {
    storeName: 'optionsTemplate'
    createdOn: Date
    updatedOn: Date
}

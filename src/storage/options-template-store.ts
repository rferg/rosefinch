import { Store } from './store'
import { CrossoverMethod, FitnessConfig } from '../genetic-algorithm'
import { MutationConfig } from '../genetic-algorithm/mutation/mutation-config'
import { SelectionConfig } from '../genetic-algorithm/selection/selection-config'

export interface OptionsTemplateStore extends Store {
    storeName: 'optionsTemplate'
    crossoverMethod: CrossoverMethod
    mutationConfig: MutationConfig
    selectionConfig: SelectionConfig
    fitnessConfigs: FitnessConfig[]
}

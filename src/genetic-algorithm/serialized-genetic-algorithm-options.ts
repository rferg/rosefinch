import { CrossoverMethod } from './crossover/crossover-method'
import { FitnessConfig } from './fitness/fitness-config'
import { GeneFactoryOptions } from './gene-factory-options'
import { MutationConfig } from './mutation/mutation-config'
import { SelectionConfig } from './selection/selection-config'

export interface SerializedGeneticAlgorithmOptions {
    crossoverMethod: CrossoverMethod
    mutationConfig: MutationConfig
    selectionConfig: SelectionConfig
    fitnessConfigs: FitnessConfig[]
    geneFactoryOptions: GeneFactoryOptions
    timeSignature: [ number, 1 | 2 | 4 | 8 | 16 ]
    measures: number
    shortestNoteDuration: 1 | 2 | 4 | 8 | 16
}

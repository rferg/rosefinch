import { SerializedPopulation } from './serialized-population'
import { CrossoverMethod } from './crossover/crossover-method'
import { FitnessConfig } from './fitness/fitness-config'
import { GeneFactoryOptions } from './gene-factory-options'
import { MutationConfig } from './mutation/mutation-config'
import { SelectionConfig } from './selection/selection-config'

export interface SerializedGeneticAlgorithm {
    kind: 'SerializedGeneticAlgorithm'
    id: string
    generation: number
    geneFactoryOptions: GeneFactoryOptions
    population: SerializedPopulation
    fitnessValues?: Int8Array
    crossoverMethod: CrossoverMethod
    mutationConfig: MutationConfig
    selectionConfig: SelectionConfig
    fitnessConfigs: FitnessConfig[]
}

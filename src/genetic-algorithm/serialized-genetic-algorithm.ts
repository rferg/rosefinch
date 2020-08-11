import { SerializedPopulation } from './serialized-population'
import { CrossoverMethod } from './crossover/crossover-method'
import { MutationMethod } from './mutation/mutation-method'
import { SelectionMethod } from './selection/selection-method'
import { FitnessConfig } from './fitness/fitness-config'
import { GeneFactoryOptions } from './gene-factory-options'

export interface SerializedGeneticAlgorithm {
    id: string
    generation: number
    geneFactoryOptions: GeneFactoryOptions
    population: SerializedPopulation
    fitnessValues: Int8Array
    crossoverMethod: CrossoverMethod
    mutationMethod: MutationMethod
    selectionMethod: SelectionMethod
    fitnessConfigs: FitnessConfig[]
}

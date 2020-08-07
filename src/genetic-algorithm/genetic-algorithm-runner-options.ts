import { Population } from './population'
import { Int8 } from '../common/int8'

export interface GeneticAlgorithmRunnerOptions {
    mutationFunction: (population: Population) => Population,
    fitnessFunction: (genome: Uint8Array) => Int8,
    selectionFunction: (population: Population, fitnessValues: Int8Array) => Population,
    crossoverFunction: (population: Population) => Population
}

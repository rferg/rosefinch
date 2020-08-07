import { Population } from './population'

export interface GeneticAlgorithmRunnerOptions {
    mutationFunction: (population: Population) => Population,
    fitnessFunction: (population: Population) => Int8Array,
    selectionFunction: (population: Population, fitnessValues: Int8Array) => Population,
    crossoverFunction: (population: Population) => Population
}

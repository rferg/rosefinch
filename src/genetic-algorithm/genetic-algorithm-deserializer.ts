import { SerializedGeneticAlgorithm } from './serialized-genetic-algorithm'
import { DeserializedGeneticAlgorithm } from './deserialized-genetic-algorithm'
import { RunData } from './run-data'
import { Population } from './population'
import { GeneFactoryOptions } from './gene-factory-options'
import { Uint8 } from '../common/uint8'
import { GeneticAlgorithmRunnerOptions } from './genetic-algorithm-runner-options'
import { MutationConfig } from './mutation/mutation-config'
import { RandomGenerator } from './random-generator'
import { CrossoverMethod } from './crossover/crossover-method'
import { RandomIntegerGenerator } from './random-integer-generator'
import { SelectionConfig } from './selection/selection-config'
import { FitnessConfig } from '.'
import { Normalizer } from './fitness/normalizer'

type GeneFactoryFactory = (options: GeneFactoryOptions) => (i: number) => Uint8

type MutationFunctionFactory = (options: {
    config: MutationConfig,
    random: RandomGenerator,
    geneFactory: (geneIndex: number) => Uint8
}) => (population: Population) => Population

type CrossoverFunctionFactory = (options: {
    method: CrossoverMethod,
    randomGenerator: RandomIntegerGenerator
}) => (population: Population) => Population

type SelectionFunctionFactory = (options: {
    config: SelectionConfig,
    randomInteger: RandomIntegerGenerator
}) => (population: Population, fitnessValues: Int8Array) => Population

type FitnessFunctionFactory = (options: {
    configs: FitnessConfig[],
    normalizer: Normalizer
}) => (population: Population) => Int8Array

export class GeneticAlgorithmDeserializer {
    constructor(
        private readonly random: RandomGenerator,
        private readonly randomInteger: RandomIntegerGenerator,
        private readonly normalizer: Normalizer,
        private readonly geneFactoryFactory: GeneFactoryFactory,
        private readonly mutationFunctionFactory: MutationFunctionFactory,
        private readonly crossoverFunctionFactory: CrossoverFunctionFactory,
        private readonly selectionFunctionFactory: SelectionFunctionFactory,
        private readonly fitnessFunctionFactory: FitnessFunctionFactory) {

    }

    deserialize(serialized: SerializedGeneticAlgorithm): DeserializedGeneticAlgorithm {
        const geneFactory = this.geneFactoryFactory(serialized.geneFactoryOptions)

        return {
            id: serialized.id,
            runData: this.getRunData(serialized, geneFactory),
            runnerOptions: this.getRunnerOptions(serialized, geneFactory)
        }
    }

    private getRunData({
        generation,
        fitnessValues,
        population
    }: SerializedGeneticAlgorithm,
    geneFactory: (i: number) => Uint8): RunData {
        return {
            generation: generation || 0,
            fitnessValues: fitnessValues || new Int8Array(population.size),
            population: new Population({
                ...population,
                geneFactory: population.array ? undefined : geneFactory
            })
        }
    }

    private getRunnerOptions({
        mutationConfig,
        selectionConfig,
        fitnessConfigs,
        crossoverMethod
    }: SerializedGeneticAlgorithm,
    geneFactory: (i: number) => Uint8): GeneticAlgorithmRunnerOptions {
        return {
            mutationFunction: this.mutationFunctionFactory({
                config: mutationConfig,
                geneFactory,
                random: this.random
            }),
            crossoverFunction: this.crossoverFunctionFactory({
                method: crossoverMethod,
                randomGenerator: this.randomInteger
            }),
            selectionFunction: this.selectionFunctionFactory({
                config: selectionConfig,
                randomInteger: this.randomInteger
            }),
            fitnessFunction: this.fitnessFunctionFactory({
                configs: fitnessConfigs,
                normalizer: this.normalizer
            })
        }
    }
}

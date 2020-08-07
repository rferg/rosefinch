import { Population } from './population'
import { GeneticAlgorithmRunnerOptions } from './genetic-algorithm-runner-options'
import { Int8 } from '../common/int8'
import { RunData } from './run-data'

export class GeneticAlgorithmRunner {
    private readonly mutationFunction: (population: Population) => Population
    private readonly fitnessFunction: (genome: Uint8Array) => Int8
    private readonly selectionFunction: (population: Population, fitnessValues: Int8Array) => Population
    private readonly crossoverFunction: (population: Population) => Population

    constructor({
        mutationFunction,
        fitnessFunction,
        selectionFunction,
        crossoverFunction
    }: GeneticAlgorithmRunnerOptions) {
        this.mutationFunction = mutationFunction
        this.fitnessFunction = fitnessFunction
        this.selectionFunction = selectionFunction
        this.crossoverFunction = crossoverFunction
    }

    run(numberOfGenerations: number, runData: RunData): RunData {
        let data: RunData = runData
        for (let i = 0; i < numberOfGenerations; i++) {
            data = this.nextGeneration(data)
        }
        return data
    }

    private nextGeneration({ population, fitnessValues, generation }: RunData): RunData {
        const parents = this.selectionFunction(population, fitnessValues)
        const children = this.mutationFunction(this.crossoverFunction(parents))
        const childFitnessValues = this.evaluateFitness(children)
        return {
            population: children,
            fitnessValues: childFitnessValues,
            generation: generation + 1
        }
    }

    private evaluateFitness(population: Population): Int8Array {
        const fitnessValues = new Int8Array(population.size)
        for (let index = 0; index < population.size; index++) {
            fitnessValues[index] = this.fitnessFunction(population.get(index))
        }
        return fitnessValues
    }
}

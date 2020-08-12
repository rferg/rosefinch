import { Population } from './population'
import { GeneticAlgorithmRunnerOptions } from './genetic-algorithm-runner-options'
import { RunData } from './run-data'
import { RunnerProgressReporter } from './runner-progress-reporter'

export class GeneticAlgorithmRunner {
    private readonly mutationFunction: (population: Population) => Population
    private readonly fitnessFunction: (population: Population) => Int8Array
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

    run(numberOfGenerations: number, runData: RunData, reportProgress: RunnerProgressReporter): RunData {
        let data: RunData = runData
        const startingGeneration = data.generation
        for (let i = 0; i < numberOfGenerations; i++) {
            data = this.nextGeneration(data)
            reportProgress({
                startingGeneration,
                currentGeneration: data.generation,
                endingGeneration: startingGeneration + numberOfGenerations
            })
        }
        return data
    }

    private nextGeneration({ population, fitnessValues, generation }: RunData): RunData {
        const parents = this.selectionFunction(population, fitnessValues)
        const children = this.mutationFunction(this.crossoverFunction(parents))
        const childFitnessValues = this.fitnessFunction(children)
        return {
            population: children,
            fitnessValues: childFitnessValues,
            generation: generation + 1
        }
    }
}

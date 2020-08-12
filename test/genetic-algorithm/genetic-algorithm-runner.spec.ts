import { Population } from '../../src/genetic-algorithm/population'
import { GeneticAlgorithmRunner } from '../../src/genetic-algorithm/genetic-algorithm-runner'
import { RunData } from '../../src/genetic-algorithm/run-data'
import { RunnerProgressReporter } from '../../src/genetic-algorithm/runner-progress-reporter'

describe('GeneticAlgorithmRunner', () => {
    let mutationSpy: jasmine.Spy<(pop: Population) => Population>
    let crossoverSpy: jasmine.Spy<(pop: Population) => Population>
    let fitnessSpy: jasmine.Spy<(pop: Population) => Int8Array>
    let selectionSpy: jasmine.Spy<(pop: Population, fitness: Int8Array) => Population>
    let progressReporter: jasmine.Spy<RunnerProgressReporter>

    let population: Population
    let runner: GeneticAlgorithmRunner

    beforeEach(() => {
        mutationSpy = jasmine.createSpy('mutationFunction', (pop: Population) => pop).and.callThrough()
        crossoverSpy = jasmine.createSpy('crossoverFunction', (pop: Population) => pop).and.callThrough()
        fitnessSpy = jasmine.createSpy('fitnessFunction', (pop: Population) => new Int8Array(pop.size))
            .and.callThrough()
        selectionSpy = jasmine.createSpy('selectionFunction', (pop: Population, _: Int8Array) => pop)
            .and.callThrough()
        progressReporter = jasmine.createSpy('progressReporter')
        population = new Population({ size: 1, genomeSize: 1 })
        runner = new GeneticAlgorithmRunner({
            mutationFunction: mutationSpy,
            fitnessFunction: fitnessSpy,
            crossoverFunction: crossoverSpy,
            selectionFunction: selectionSpy
        })
    })

    describe('run', () => {
        it('should return original run data if numberOfGenerations is 0', () => {
            const runData: RunData = {
                population,
                fitnessValues: new Int8Array(population.size),
                generation: 0
            }

            const result = runner.run(0, runData, progressReporter)

            expect(result).toEqual(runData)
        })

        it('should increment generations number correctly', () => {
            const runData: RunData = {
                population,
                fitnessValues: new Int8Array(population.size),
                generation: 0
            }
            const numberOfGenerations = 11
            const expectedGeneration = runData.generation + numberOfGenerations

            const result = runner.run(numberOfGenerations, runData, progressReporter)

            expect(result.generation).toBe(expectedGeneration)
        })

        it('should call progress reporter with correct report', () => {
            const runData: RunData = {
                population,
                fitnessValues: new Int8Array(population.size),
                generation: 3
            }
            const numberOfGenerations = 3
            const expectedEndingGeneration = runData.generation + numberOfGenerations

            runner.run(numberOfGenerations, runData, progressReporter)

            expect(progressReporter).toHaveBeenCalledTimes(numberOfGenerations)
            for (let generation = 0; generation < numberOfGenerations; generation++) {
                const { startingGeneration, currentGeneration, endingGeneration } =
                    progressReporter.calls.all()[generation].args[0]
                expect(startingGeneration).toBe(runData.generation)
                expect(endingGeneration).toBe(expectedEndingGeneration)
                expect(currentGeneration).toBe(generation + runData.generation + 1)
            }
        })

        it('should call selectionFunction and pass results to crossoverFunction, ' +
            'then mutationFunction, and then fitnessFunction',
            () => {
                const parents = new Population({ size: population.size, genomeSize: population.genomeSize })
                selectionSpy.and.returnValue(parents)
                const crossoverResult = new Population({ size: parents.size, genomeSize: parents.size })
                crossoverSpy.and.returnValue(crossoverResult)
                const children = new Population({ size: crossoverResult.size, genomeSize: crossoverResult.genomeSize })
                mutationSpy.and.returnValue(children)
                const expectedFitnessValues = new Int8Array(population.size)
                for (let index = 0; index < population.size; index++) {
                    expectedFitnessValues[index] = 1
                }
                fitnessSpy.and.returnValue(expectedFitnessValues)

                const runData = {
                    population,
                    fitnessValues: new Int8Array(population.size),
                    generation: 0
                }
                const result = runner.run(1, runData, progressReporter)

                expect(result.population).toEqual(children)
                expect(result.fitnessValues).toEqual(expectedFitnessValues)
                expect(selectionSpy).toHaveBeenCalledWith(runData.population, runData.fitnessValues)
                expect(crossoverSpy).toHaveBeenCalledWith(parents)
                expect(mutationSpy).toHaveBeenCalledWith(crossoverResult)
                expect(fitnessSpy).toHaveBeenCalledWith(children)
            })
    })
})

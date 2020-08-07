import { Population } from '../../src/genetic-algorithm/population'
import { GeneticAlgorithmRunner } from '../../src/genetic-algorithm/genetic-algorithm-runner'
import { RunData } from '../../src/genetic-algorithm/run-data'

describe('GeneticAlgorithmRunner', () => {
    const mutationSpy = jasmine.createSpy('mutationFunction', (pop: Population) => pop).and.callThrough()
    const crossoverSpy = jasmine.createSpy('crossoverFunction', (pop: Population) => pop).and.callThrough()
    const fitnessSpy = jasmine.createSpy('fitnessFunction', (pop: Population) => new Int8Array(pop.size))
        .and.callThrough()
    const selectionSpy = jasmine.createSpy('selectionFunction', (pop: Population, _: Int8Array) => pop)
        .and.callThrough()

    let population: Population
    let runner: GeneticAlgorithmRunner

    beforeEach(() => {
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

            const result = runner.run(0, runData)

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

            const result = runner.run(numberOfGenerations, runData)

            expect(result.generation).toBe(expectedGeneration)
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
                const result = runner.run(1, runData)

                expect(result.population).toEqual(children)
                expect(result.fitnessValues).toEqual(expectedFitnessValues)
                expect(selectionSpy).toHaveBeenCalledWith(runData.population, runData.fitnessValues)
                expect(crossoverSpy).toHaveBeenCalledWith(parents)
                expect(mutationSpy).toHaveBeenCalledWith(crossoverResult)
                expect(fitnessSpy).toHaveBeenCalledWith(children)
            })
    })
})

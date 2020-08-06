import { Population } from '../../src/genetic-algorithm/population'
import { GeneticAlgorithmRunner } from '../../src/genetic-algorithm/genetic-algorithm-runner'
import { Int8 } from '../../src/common/int8'
import { RunData } from '../../src/genetic-algorithm/run-data'

describe('GeneticAlgorithmRunner', () => {
    const mutationSpy = jasmine.createSpy('mutationFunction', (pop: Population) => pop).and.callThrough()
    const crossoverSpy = jasmine.createSpy('crossoverFunction', (pop: Population) => pop).and.callThrough()
    const fitnessSpy = jasmine.createSpy('fitnessFunction', (_: Uint8Array) => 1 as Int8).and.callThrough()
    const parentSelectionSpy = jasmine.createSpy('parentSelectionFunction', (pop: Population, _: Int8Array) => pop)
        .and.callThrough()

    let population: Population
    let runner: GeneticAlgorithmRunner

    beforeEach(() => {
        population = new Population({ size: 1, genomeSize: 1 })
        runner = new GeneticAlgorithmRunner({
            mutationFunction: mutationSpy,
            fitnessFunction: fitnessSpy,
            crossoverFunction: crossoverSpy,
            parentSelectionFunction: parentSelectionSpy
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

        it('should call parentSelectionFunction and pass results to crossoverFunction, ' +
            'then mutationFunction, and then fitnessFunction',
            () => {
                const parents = new Population({ size: population.size, genomeSize: population.genomeSize })
                parentSelectionSpy.and.returnValue(parents)
                const crossoverResult = new Population({ size: parents.size, genomeSize: parents.size })
                crossoverSpy.and.returnValue(crossoverResult)
                const children = new Population({ size: crossoverResult.size, genomeSize: crossoverResult.genomeSize })
                mutationSpy.and.returnValue(children)
                const fitness = 8
                fitnessSpy.and.returnValue(fitness)
                const expectedFitnessValues = new Int8Array(population.size)
                for (let index = 0; index < population.size; index++) {
                    expectedFitnessValues[index] = fitness
                }

                const runData = {
                    population,
                    fitnessValues: new Int8Array(population.size),
                    generation: 0
                }
                const result = runner.run(1, runData)

                expect(result.population).toEqual(children)
                expect(result.fitnessValues).toEqual(expectedFitnessValues)
                expect(parentSelectionSpy).toHaveBeenCalledWith(runData.population, runData.fitnessValues)
                expect(crossoverSpy).toHaveBeenCalledWith(parents)
                expect(mutationSpy).toHaveBeenCalledWith(crossoverResult)
                for (const child of children) {
                    expect(fitnessSpy).toHaveBeenCalledWith(child)
                }
            })
    })
})

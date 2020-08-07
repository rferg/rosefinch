import { fitnessFunctionComposer } from '../../../src/genetic-algorithm/fitness/fitness-function-composer'
import { Population } from '../../../src/genetic-algorithm/population'
import { Int8 } from '../../../src/common/int8'

describe('fitnessFunctionComposer', () => {
    const defaultNormalizer = (values: Int16Array) => new Int8Array(values)
    const defaultFitnessFunction = (pop: Population) => new Int8Array(pop.size)

    it('should throw if no functions provided', () => {
        expect(() => fitnessFunctionComposer({ functions: [], weights: [], normalizer: defaultNormalizer }))
            .toThrowError(/at least one fitness function/i)
    })

    describe('returned function', () => {
        it('should return array of same length as population', () => {
            const functions = [
                (pop: Population) => new Int8Array(pop.size),
                (pop: Population) => new Int8Array(pop.size)
            ]
            const population = new Population({ size: 8, genomeSize: 1 })

            const composed = fitnessFunctionComposer({
                functions,
                weights: [],
                normalizer: defaultNormalizer
            })
            const result = composed(population)

            expect(result.length).toEqual(population.size)
        })

        it('should call normalizer', () => {
            const normalizer = jasmine.createSpy('normalizer', defaultNormalizer).and.callThrough()
            const population = new Population({ size: 1, genomeSize: 1 })

            const composed = fitnessFunctionComposer({
                functions: [ defaultFitnessFunction ],
                weights: [],
                normalizer
            })
            composed(population)

            expect(normalizer).toHaveBeenCalledWith(new Int16Array(population.size))
        })

        it('should use 1 as default weight', () => {
            const fitness = 34
            const fitnessFunction = getFitnessFunctionThatAlwaysReturns(fitness)
            const population = new Population({ size: 1, genomeSize: 1 })

            const results = fitnessFunctionComposer({
                functions: [ fitnessFunction ],
                weights: [],
                normalizer: defaultNormalizer
            })(population)

            for (const result of results) {
                expect(result).toBe(fitness)
            }
        })

        it('should sum values from individual functions', () => {
            const fitness = 1
            const fitnessFunction = getFitnessFunctionThatAlwaysReturns(fitness)
            const functions = [ fitnessFunction, fitnessFunction, fitnessFunction ]
            const population = new Population({ size: 3, genomeSize: 1 })

            const results = fitnessFunctionComposer({
                functions,
                weights: [],
                normalizer: defaultNormalizer
            })(population)

            for (const result of results) {
                expect(result).toBe(fitness * functions.length)
            }
        })

        it('should multiply fitness results by weights', () => {
            const fitness = 1
            const fitnessFunction = getFitnessFunctionThatAlwaysReturns(fitness)
            const functions = [ fitnessFunction, fitnessFunction, fitnessFunction ]
            const weights = [ -1, 2, 3 ]
            const population = new Population({ size: 3, genomeSize: 1 })

            const results = fitnessFunctionComposer({
                functions,
                weights,
                normalizer: defaultNormalizer
            })(population)

            // Since fitness functions always return 1, result should the sum of weights.
            const expected = weights.reduce((acc, curr) => acc + curr, 0)
            for (const result of results) {
                expect(result).toBe(expected)
            }
        })
    })
})

function getFitnessFunctionThatAlwaysReturns(fitness: Int8): (pop: Population) => Int8Array {
    return (pop: Population) => {
        const fitnessValues = new Int8Array(pop.size)
        for (let index = 0; index < fitnessValues.length; index++) {
            fitnessValues[index] = fitness
        }
        return fitnessValues
    }
}

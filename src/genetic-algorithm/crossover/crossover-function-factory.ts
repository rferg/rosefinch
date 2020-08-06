import { Population } from '../population'
import { CrossoverMethod } from './crossover-method'
import { RandomIntegerGenerator } from '../random-integer-generator'
import { hybridPointCrossoverFactory } from './hybrid-point-crossover-factory'

export function crossoverFunctionFactory({ method, randomGenerator }: {
    method: CrossoverMethod,
    randomGenerator: RandomIntegerGenerator
}): (population: Population) => Population {
    switch (method) {
        case CrossoverMethod.HybridPoint:
            return hybridPointCrossoverFactory({ randomGenerator })
        default:
            throw new Error(`Invalid crossover method: ${method}!`)
    }
}

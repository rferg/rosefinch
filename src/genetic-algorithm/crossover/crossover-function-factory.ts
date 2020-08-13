import { Population } from '../population'
import { CrossoverMethod } from './crossover-method'
import { RandomIntegerGenerator } from '../random-integer-generator'
import { hybridPointCrossoverFactory } from './hybrid-point-crossover-factory'
import { assertUnreachable } from '../../common/assert-unreachable'

export function crossoverFunctionFactory({ method, randomGenerator }: {
    method: CrossoverMethod,
    randomGenerator: RandomIntegerGenerator
}): (population: Population) => Population {
    switch (method) {
        case CrossoverMethod.HybridPoint:
            return hybridPointCrossoverFactory({ randomGenerator })
        default:
            assertUnreachable(method, `Invalid crossover method: ${method}!`)
    }
}

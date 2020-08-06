import { Population } from '../population'
import { RandomGenerator } from '../random-generator'
import { MutationMethod } from './mutation-method'
import { RandomIntegerGenerator } from '../random-integer-generator'
import { pointMutationFactory } from './point-mutation-factory'

export function mutationFunctionFactory({
    method,
    mutationRate,
    random,
    randomInteger
}: {
    method: MutationMethod,
    mutationRate: number,
    random: RandomGenerator,
    randomInteger: RandomIntegerGenerator
}): (population: Population) => Population {
    switch (method) {
        case MutationMethod.Point:
            return pointMutationFactory({ mutationRate, random, randomInteger })
        default:
            throw new Error(`Invalid mutation method: ${method}!`)
    }
}

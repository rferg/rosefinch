import { Population } from '../population'
import { RandomGenerator } from '../random-generator'
import { MutationMethod } from './mutation-method'
import { pointMutationFactory } from './point-mutation-factory'
import { Uint8 } from '../../common/uint8'

export function mutationFunctionFactory({
    method,
    mutationRate,
    random,
    geneFactory
}: {
    method: MutationMethod,
    mutationRate: number,
    random: RandomGenerator,
    geneFactory: (geneIndex: number) => Uint8
}): (population: Population) => Population {
    switch (method) {
        case MutationMethod.Point:
            return pointMutationFactory({ mutationRate, random, geneFactory })
        default:
            throw new Error(`Invalid mutation method: ${method}!`)
    }
}

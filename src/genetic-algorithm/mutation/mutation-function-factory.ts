import { Population } from '../population'
import { RandomGenerator } from '../random-generator'
import { MutationMethod } from './mutation-method'
import { pointMutationFactory } from './point-mutation-factory'
import { Uint8 } from '../../common/uint8'
import { MutationConfig } from './mutation-config'
import { assertUnreachable } from '../../common/assert-unreachable'

export function mutationFunctionFactory({
    config: { method, mutationRate },
    random,
    geneFactory
}: {
    config: MutationConfig,
    random: RandomGenerator,
    geneFactory: (geneIndex: number) => Uint8
}): (population: Population) => Population {
    switch (method) {
        case MutationMethod.Point:
            return pointMutationFactory({ mutationRate: mutationRate || 0.05, random, geneFactory })
        default:
            assertUnreachable(method, `Invalid mutation method: ${method}!`)
    }
}

import { FitnessConfig } from './fitness-config'
import { Population } from '../population'
import { FitnessMethod } from './fitness-method'
import { fitnessFunctionComposer } from './fitness-function-composer'
import { Normalizer } from './normalizer'

export function fitnessFunctionFactory({
    configs,
    normalizer
}: {
    configs: FitnessConfig[],
    normalizer: Normalizer
}): (population: Population) => Int8Array {
    const functions = configs.map(({ method, options }) => getFunction(method, options))
    const weights = configs.map(({ weight }) => weight ?? 1)
    return fitnessFunctionComposer({ functions, weights, normalizer })
}

function getFunction(
    method: FitnessMethod,
    options?: { [key: string]: any }): (population: Population) => Int8Array {
    throw new Error('not implemented' + method + options)
}

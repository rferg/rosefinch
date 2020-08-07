import { Population } from '../population'
import { Normalizer } from './normalizer'

export function fitnessFunctionComposer({
    functions,
    weights,
    normalizer
}: {
    functions: ((population: Population) => Int8Array)[],
    weights: number[],
    normalizer: Normalizer
}): (population: Population) => Int8Array {
    const definedFunctions = functions.filter(func => !!func)
    if (!definedFunctions?.length) {
        throw new Error('fitnessFunctionComposer must have at least one fitness function!')
    }
    return (population: Population) => {
        // Summed Int8 (-2^7, 2^7) values are unlikely to be close to 2^15 (or -2^15).
        // We will only have ~10 fitness functions. And weights should be small (-5 <= x <= 5).
        // But they could easily overflow Int8, so Int16 is best option.
        const rawValues = new Int16Array(population.size)
        for (let functionIndex = 0; functionIndex < definedFunctions.length; functionIndex++) {
            const fitnessFunction = definedFunctions[functionIndex]
            const weight = (weights?.length ?? 0) > functionIndex ? weights[functionIndex] : 1
            const fitnesses = normalizer(fitnessFunction(population))
            for (let genomeIndex = 0; genomeIndex < fitnesses.length; genomeIndex++) {
                rawValues[genomeIndex] += (fitnesses[genomeIndex] * weight)
            }
        }

        return normalizer(rawValues)
    }
}

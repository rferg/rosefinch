import { RandomIntegerGenerator } from '../random-integer-generator'
import { Population } from '../population'
import { Int8 } from '../../common/int8'

export function tournamentSelectionFactory({
    randomInteger,
    tournamentSize
}: {
    randomInteger: RandomIntegerGenerator,
    tournamentSize: number
}): (population: Population, fitnessValues: Int8Array) => Population {
    return (population, fitnessValues) => {
        const results = new Population({ size: population.size, genomeSize: population.genomeSize })
        for (let genomeIndex = 0; genomeIndex < population.size; genomeIndex++) {
            let best: Uint8Array | undefined
            let bestFitness: Int8 = -128
            for (let contenderCount = 0; contenderCount < tournamentSize; contenderCount++) {
                const contenderIndex = randomInteger(0, population.size)
                const contender = population.get(contenderIndex)
                const contenderFitness = fitnessValues[contenderIndex] as Int8
                if (!best || contenderFitness > bestFitness) {
                    best = contender
                    bestFitness = contenderFitness
                }
            }
            if (!best) {
                throw new Error(`No winner in tournament ${genomeIndex} was selected!`)
            }
            results.get(genomeIndex).set(best)
        }
        return results
    }
}

import { RandomGenerator } from '../random-generator'
import { Population } from '../population'
import { RandomIntegerGenerator } from '../random-integer-generator'
import { GeneUtil } from '../../common/gene-util'

export function pointMutationFactory({
    mutationRate,
    random,
    randomInteger
}: {
    mutationRate: number,
    random: RandomGenerator,
    randomInteger: RandomIntegerGenerator
}): (population: Population) => Population {
    return population => {
        const maxMutatedValue = GeneUtil.MAX_NOTE_VALUE + 1
        for (let genomeIndex = 0; genomeIndex < population.size; genomeIndex++) {
            const genome = population.get(genomeIndex)
            for (let geneIndex = 0; geneIndex < population.genomeSize; geneIndex++) {
                if (random() <= mutationRate) {
                    genome[genomeIndex] = randomInteger(0, maxMutatedValue)
                }
            }
        }
        return population
    }
}

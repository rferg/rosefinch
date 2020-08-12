import { RandomGenerator } from '../random-generator'
import { Population } from '../population'
import { Uint8 } from '../../common/uint8'

export function pointMutationFactory({
    mutationRate,
    random,
    geneFactory
}: {
    mutationRate: number,
    random: RandomGenerator,
    geneFactory: (geneIndex: number) => Uint8
}): (population: Population) => Population {
    mutationRate = Math.max(mutationRate, 0)
    return population => {
        for (let genomeIndex = 0; genomeIndex < population.size; genomeIndex++) {
            const genome = population.get(genomeIndex)
            for (let geneIndex = 0; geneIndex < population.genomeSize; geneIndex++) {
                if (random() < mutationRate) {
                    genome[genomeIndex] = geneFactory(geneIndex)
                }
            }
        }
        return population
    }
}

import { RandomIntegerGenerator } from '../random-integer-generator'
import { Population } from '../population'

/**
 * Returns a hybrid point crossover function.
 *
 * With ~.5 probability, the function will perform two-point crossover, in which genes
 * between two random non-initial points are switched.  Otherwise, it will
 * perform one-point crossover, where genes between the beginning and a random point in the genome
 * are switched.
 * @param { randomGenerator }
 * @returns hybrid point crossover function
 */
export function hybridPointCrossoverFactory({
    randomGenerator
}: { randomGenerator: RandomIntegerGenerator }): (population: Population) => Population {
        return (population: Population) => {
            const children = new Population({ size: population.size, genomeSize: population.genomeSize })
            for (let genomeIndex = 0; genomeIndex < population.size; genomeIndex += 2) {
                // If population size is odd, there will be one parent left at end.
                // Just copy this into child.
               if (genomeIndex > population.size - 2) {
                   const child = children.get(genomeIndex)
                   child.set(population.get(genomeIndex))
                   break
               }
               // Get two parents and copy them into next generation.
               const parentA = population.get(genomeIndex)
               const parentB = population.get(genomeIndex + 1)
               const childA = children.get(genomeIndex)
               childA.set(parentA)
               const childB = children.get(genomeIndex + 1)
               childB.set(parentB)
               // Generate two crossover points.  One has a 1/2 probability of being
               // 0, o.w. it's a non-zero point.  The other is a non-zero-point.  This means
               // that about half the time, this will be equivalent to single-point crossover, o.w.
               // it's two-point crossover with non-zero points.
               const [ firstPoint, secondPoint ] = [
                    randomGenerator(0, 2) ? randomGenerator(1, population.genomeSize + 1) : 0,
                    randomGenerator(1, population.genomeSize + 1)
               ].sort((a, b) => a - b)
               // Switch genes between two crossover points.
               for (let geneIndex = firstPoint; geneIndex < secondPoint; geneIndex++) {
                   childA[geneIndex] = parentB[geneIndex]
                   childB[geneIndex] = parentA[geneIndex]
               }
            }
            return children
        }
}

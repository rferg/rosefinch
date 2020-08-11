import { Population } from '../population'
import { GeneUtil } from '../../common/gene-util'
import { Pitch } from '../../common/pitch'
import { Uint8 } from '../../common/uint8'
/**
 * Returns fitness function that evaluates genome's fitness
 * by calculating the proportion of genes that are Pitch.Rests
 * and measuring the distance from a target proportion.
 * This will be the simple formula:
 *
 * fitness = -Math.round(Math.abs(actual - target) * 100)
 *
 * Therefore, the maximum fitness will be 0 and minimum will be -100.
 * @param options.targetProportion should be between 0 and 1
 * @returns rest proportion fitness function
 */
export function restProportionFactory({
    targetProportion
}: {
    targetProportion: number
}): (population: Population) => Int8Array {
    targetProportion = Math.min(Math.max(0, targetProportion), 1)
    return (population: Population) => {
        const results = new Int8Array(population.size)
        for (let genomeIndex = 0; genomeIndex < population.size; genomeIndex++) {
            const genome = population.get(genomeIndex)
            const actualProportion = genome
                .filter(gene => GeneUtil.getPitch(gene as Uint8) === Pitch.Rest).length / genome.length
            const difference = Math.abs(actualProportion - targetProportion)
            results[genomeIndex] = -Math.round(difference * 100)
        }
        return results
    }
}

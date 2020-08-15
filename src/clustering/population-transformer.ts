import { SerializedPopulation } from '../genetic-algorithm'
import { GeneUtil } from '../common/gene-util'
import { Uint8 } from '../common/uint8'

export function populationTransformer({ array, genomeSize }: SerializedPopulation): number[][] {
    if (!array) {
        throw new Error('populationTransformer was given SerializedPopulation with no array.')
    }

    const result: number[][] = []
    let currentItem: number[] = []
    for (let geneIndex = 0; geneIndex < array.length; geneIndex++) {
        const gene = array[geneIndex] as Uint8
        currentItem.push(GeneUtil.getPitch(gene), GeneUtil.getOctave(gene))

        if (geneIndex % genomeSize === genomeSize - 1) {
            result.push(currentItem)
            currentItem = []
        }
    }

    return result
}

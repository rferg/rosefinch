import { populationTransformer } from '../../src/clustering/population-transformer'
import { SerializedPopulation } from '../../src/genetic-algorithm'
import { GeneUtil } from '../../src/common/gene-util'
import { Uint8 } from '../../src/common/uint8'

describe('populationTransformer', () => {
    it('should throw if given population with undefined array', () => {
        expect(() => populationTransformer({ genomeSize: 1, size: 1 }))
            .toThrowError(/SerializedPopulation with no array/i)
    })

    it('should return 2d array where number of rows is the' +
        ' population size and number of columns is 2 * genomeSize', () => {
            const tests: SerializedPopulation[] = [
                { size: 3, genomeSize: 5, array: new Uint8Array(3 * 5) },
                { size: 4, genomeSize: 5, array: new Uint8Array(4 * 5) },
                { size: 4, genomeSize: 6, array: new Uint8Array(4 * 6) },
                { size: 1, genomeSize: 1, array: new Uint8Array(1) }
            ]
            tests.forEach(pop => {
                const result = populationTransformer(pop)

                expect(result.length).toBe(pop.size)
                result.forEach(row => expect(row.length).toBe(pop.genomeSize * 2))
            })
    })

    it('should return each gene\'s pitch and octave', () => {
        const genes = [ 34, 0, 89, 101 ]
        const expected = genes
            .reduce((agg, curr) => {
                agg.push(GeneUtil.getPitch(curr as Uint8), GeneUtil.getOctave(curr as Uint8))
                return agg
            }, [] as number[])

        const result = populationTransformer({ size: 1, genomeSize: genes.length, array: new Uint8Array(genes) })

        expect(result[0]).toEqual(expected)
    })
})

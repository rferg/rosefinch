import { RandomGenerator } from '../../../src/genetic-algorithm/random-generator'
import { Population } from '../../../src/genetic-algorithm/population'
import { pointMutationFactory } from '../../../src/genetic-algorithm/mutation/point-mutation-factory'
import { Uint8 } from '../../../src/common/uint8'

describe('PointMutation', () => {
    let random: jasmine.Spy<RandomGenerator>
    let geneFactory: jasmine.Spy<(i: number) => Uint8>
    let mutate: (p: Population) => Population
    const mutationRate = 0.5

    beforeEach(() => {
        random = jasmine.createSpy('randomGenerator', () => 0.9).and.callThrough()
        geneFactory = jasmine.createSpy('geneFactor', (_: number) => 0)
            .and.callThrough()
        mutate = pointMutationFactory({ mutationRate, random, geneFactory })
    })

    it('should return same population if no mutations', () => {
        const population = new Population({ size: 3, genomeSize: 3 })

        const result = mutate(population)

        expect(result).toEqual(population)
    })

    it('should mutate if random generates number <= mutationRate, else it should not', () => {
        const population = new Population({ size: 1, genomeSize: 5 })
        const mutatedValue = 77
        random.and.returnValues(mutationRate - 0.1, 0.9)
        geneFactory.and.returnValue(mutatedValue)

        const result = mutate(population)

        expect(result.get(0)[0]).toEqual(mutatedValue)
        expect(geneFactory).toHaveBeenCalledWith(0)
        expect(geneFactory).toHaveBeenCalledTimes(1)
        expect(result.get(0).slice(1).every(x => x === 0)).toBeTrue()
    })
})

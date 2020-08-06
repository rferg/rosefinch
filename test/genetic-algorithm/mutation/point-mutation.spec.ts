import { RandomGenerator } from '../../../src/genetic-algorithm/random-generator'
import { RandomIntegerGenerator } from '../../../src/genetic-algorithm/random-integer-generator'
import { Population } from '../../../src/genetic-algorithm/population'
import { pointMutationFactory } from '../../../src/genetic-algorithm/mutation/point-mutation-factory'
import { GeneUtil } from '../../../src/common/gene-util'

describe('PointMutation', () => {
    let random: jasmine.Spy<RandomGenerator>
    let randomInteger: jasmine.Spy<RandomIntegerGenerator>
    let mutate: (p: Population) => Population
    const mutationRate = 0.5

    beforeEach(() => {
        random = jasmine.createSpy('randomGenerator', () => 0.9).and.callThrough()
        randomInteger = jasmine.createSpy('randomIntegerGenerator', (min: number, _max: number) => min)
            .and.callThrough()
        mutate = pointMutationFactory({ mutationRate, random, randomInteger })
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
        randomInteger.and.returnValue(mutatedValue)

        const result = mutate(population)

        expect(result.get(0)[0]).toEqual(mutatedValue)
        expect(result.get(0).slice(1).every(x => x === 0)).toBeTrue()
        expect(randomInteger).toHaveBeenCalledWith(0, GeneUtil.MAX_NOTE_VALUE + 1)
    })
})

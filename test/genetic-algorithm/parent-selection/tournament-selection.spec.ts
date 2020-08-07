import { RandomIntegerGenerator } from '../../../src/genetic-algorithm/random-integer-generator'
import { Population } from '../../../src/genetic-algorithm/population'
import { tournamentSelectionFactory } from '../../../src/genetic-algorithm/parent-selection/tournament-selection-factory'
import { Uint8 } from '../../../src/common/uint8'

describe('TournamentSelection', () => {
    let randomInteger: jasmine.Spy<RandomIntegerGenerator>
    let select: (population: Population, fitnessValues: Int8Array) => Population
    const defaultTournamentSize = 2

    beforeEach(() => {
        randomInteger = jasmine.createSpy('randomInteger', (min: number, _max: number) => min).and.callThrough()
        select = tournamentSelectionFactory({
            randomInteger,
            tournamentSize: defaultTournamentSize
        })
    })

    it('should return population of same size', () => {
        const population = new Population({ size: 5, genomeSize: 1 })
        const fitnessValues = new Int8Array(population.size)

        const results = select(population, fitnessValues)

        expect(results.size).toEqual(population.size)
    })

    it('should evaluate population.size x tournamentSize contenders', () => {
        const population = new Population({ size: 5, genomeSize: 1 })
        const populationGetSpy = spyOn(population, 'get').and.callThrough()
        const fitnessValues = new Int8Array(population.size)

        select(population, fitnessValues)

        const times = population.size * defaultTournamentSize
        expect(populationGetSpy).toHaveBeenCalledTimes(times)
        expect(randomInteger).toHaveBeenCalledWith(0, population.size)
        expect(randomInteger).toHaveBeenCalledTimes(times)
    })

    it('should select the contender with the highest fitness', () => {
        const population = new Population({
            size: 2,
            genomeSize: 4,
            geneFactory: (index: number) => index as Uint8
        })
        const fitnessValues = new Int8Array(population.size)
        fitnessValues[0] = 1
        fitnessValues[1] = 2
        // Alternate so both genomes are chosen in each tournament,
        // thus, the highest fitness should be chosen each time.
        randomInteger.and.returnValues(0, 1, 0, 1)

        const results = select(population, fitnessValues)

        for (const genome of results) {
            expect(genome).toEqual(population.get(1))
        }
    })
})

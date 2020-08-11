import { Population } from '../../src/genetic-algorithm/population'
import { Uint8 } from '../../src/common/uint8'

describe('Population', () => {
    describe('constructor', () => {
        it('should throw if size is <= 0', () => {
            [ 0, -1 ].forEach(size => {
                expect(() => new Population({ size, genomeSize: 1 })).toThrow()
            })
        })

        it('should throw if genomeSize is <= 0', () => {
            [ 0, -1 ].forEach(genomeSize => {
                expect(() => new Population({ genomeSize, size: 1 })).toThrow()
            })
        })

        it('should throw if given array but size !== array.length / genomeSize', () => {
            const array = new Uint8Array(10)

            expect(() => new Population({ size: 2, genomeSize: 4, array: array }))
                .toThrowError(/does not match given array length.*divided by genomeSize/i)
        })

        it('should set array and size if given array', () => {
            const array = new Uint8Array([ 1, 1, 1, 1 ])
            const genomeSize = 2
            const size = array.length / genomeSize

            const population = new Population({ size, genomeSize, array })

            expect(population.size).toBe(size)
            for (const genome of population) {
                expect(genome.every(gene => gene === 1)).toBeTrue()
            }
        })

        it('should initialize genes to 0 if no geneFactory provided', () => {
            const size = 3
            const genomeSize = 5
            const population = new Population({ size, genomeSize })
            let genomeCount = 0
            for (const genome of population) {
                expect(genome.length).toBe(genomeSize)
                expect(genome.every(gene => gene === 0)).toBeTrue()
                genomeCount++
            }
            expect(genomeCount).toBe(size)
        })

        it('should initialize genes with geneFactory if provided', () => {
            const expectedGene: Uint8 = 34
            const geneFactory = () => expectedGene
            const size = 2
            const genomeSize = 8
            const population = new Population({ size, genomeSize, geneFactory })
            let genomeCount = 0
            for (const genome of population) {
                expect(genome.length).toBe(genomeSize)
                expect(genome.every(gene => gene === expectedGene)).toBeTrue()
                genomeCount++
            }
            expect(genomeCount).toBe(size)
        })
    })

    describe('next', () => {
        let population: Population
        const size = 3
        const genomeSize = 5
        const geneFactory = (index: number) => index as Uint8

        beforeEach(() => {
            population = new Population({ size, genomeSize, geneFactory })
        })

        it('should return first genome', () => {
            const { done, value: genome } = population.next()

            expect(done).toBeFalse()
            expect(genome).toBeTruthy()
            expect(genome?.length).toBe(genomeSize)
            if (genome) {
                for (let i = 0; i < genomeSize; i++) {
                    expect(genome[i]).toBe(i)
                }
            }
        })

        it('should return next genome', () => {
            population.next()

            const { done, value: genome } = population.next()

            expect(done).toBeFalse()
            expect(genome).toBeTruthy()
            expect(genome?.length).toBe(genomeSize)
            if (genome) {
                for (let i = 0; i < genomeSize; i++) {
                    // add genomeSize since this should be the second genome
                    expect(genome[i]).toBe(i + genomeSize)
                }
            }
        })

        it('should return terminating result when finished', () => {
            for (let i = 0; i < size; i++) {
                population.next()
            }

            const { done, value } = population.next()

            expect(done).toBeTrue()
            expect(value).toBeNull()
        })
    })

    describe('get', () => {
        let population: Population
        const size = 3
        const genomeSize = 5
        const geneFactory = (index: number) => index as Uint8

        beforeEach(() => {
            population = new Population({
                size,
                genomeSize,
                geneFactory
            })
        })

        it('should throw if index is negative', () => {
            expect(() => population.get(-1)).toThrowError(/out of range/gi)
        })

        it('should throw if index is >= size of population', () => {
            [ size, size + 1 ].forEach(s =>
                expect(() => population.get(s)).toThrowError(/out of range/gi))
        })

        it('should return correct subarray', () => {
            for (let genomeIndex = 0; genomeIndex < size; genomeIndex++) {
                const genome = population.get(genomeIndex)
                for (let geneIndex = 0; geneIndex < genome.length; geneIndex++) {
                    // This should obtain based on geneFactory
                    expect(genome[geneIndex]).toBe(genomeIndex * genomeSize + geneIndex)
                }
            }
        })

        it('should return subarray such that it can mutate underlying array', () => {
            const genome = population.get(0)
            const newValue = 89
            genome[0] = newValue

            const sameGenome = population.get(0)

            expect(sameGenome[0]).toBe(newValue)
        })
    })

    describe('serialize', () => {
        it('should return size, genomeSize, and array', () => {
            const array = new Uint8Array([ 1, 2, 3, 4, 5, 9 ])
            const genomeSize = 2
            const size = array.length / genomeSize
            const population = new Population({ size, genomeSize, array })

            const serialized = population.serialize()

            expect(serialized.size).toBe(size)
            expect(serialized.genomeSize).toBe(genomeSize)
            expect(serialized.array).toEqual(array)
        })
    })
})

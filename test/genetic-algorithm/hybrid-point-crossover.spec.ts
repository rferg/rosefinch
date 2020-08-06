import { hybridPointCrossoverFactory } from '../../src/genetic-algorithm/crossover/hybrid-point-crossover-factory'
import { Population } from '../../src/genetic-algorithm/population'
import { Uint8 } from '../../src/common/uint8'

describe('HybridPointCrossover', () => {
    let random: jasmine.Spy<(min: number, max: number) => number>
    let crossover: (population: Population) => Population
    let population: Population

    beforeEach(() => {
        random = jasmine.createSpy('randomGenerator', (min: number, _max: number) => min).and.callThrough()
        crossover = hybridPointCrossoverFactory({ randomGenerator: random })
        population = new Population({
            size: 2,
            genomeSize: 8,
            geneFactory: (index: number) => {
                return index < 8 ? 0 : 1
            }
        })
    })

    it('should copy last parent if population size is odd', () => {
        const oddPopulation = new Population({ size: 3, genomeSize: 3, geneFactory: (index) => index as Uint8 })

        const children = crossover(oddPopulation)

        expect(oddPopulation.get(oddPopulation.size - 1)).toEqual(children.get(oddPopulation.size - 1))
        expect(children.size).toEqual(oddPopulation.size)
        expect(children.genomeSize).toEqual(oddPopulation.genomeSize)
    })

    describe('two-point crossover', () => {
        const setupSpy = (firstPoint: number, secondPoint: number) => {
            random.and.returnValues(1, firstPoint, secondPoint)
        }

        it('should not change children if points are identical', () => {
            setupSpy(1, 1)

            const children = crossover(population)

            for (let index = 0; index < population.size; index++) {
                expect(children.get(index)).toEqual(population.get(index))
            }
        })

        it('should still crossover if first generated point is greater than second', () => {
            const lowerPoint = 1
            const higherPoint = 2
            setupSpy(higherPoint, lowerPoint)

            const children = crossover(population)

            for (let index = 0; index < population.genomeSize; index++) {
                if (index < lowerPoint || index >= higherPoint) {
                    expect(children.get(0)[index]).toEqual(population.get(0)[index])
                    expect(children.get(1)[index]).toEqual(population.get(1)[index])
                } else {
                    expect(children.get(1)[index]).toEqual(population.get(0)[index])
                    expect(children.get(0)[index]).toEqual(population.get(1)[index])
                }
            }
        })

        const points: [number, number][] = [
            [ 1, 8 ],
            [ 2, 4 ],
            [ 3, 8 ],
            [ 7, 8 ],
            [ 2, 7 ]
        ]

        points.forEach(([ firstPoint, secondPoint ]) => {
            it(`should crossover correctly with points: ${firstPoint}, ${secondPoint}`, () => {
                setupSpy(firstPoint, secondPoint)

                const children = crossover(population)

                for (let index = 0; index < population.genomeSize; index++) {
                    if (index < firstPoint || index >= secondPoint) {
                        expect(children.get(0)[index]).toEqual(population.get(0)[index])
                        expect(children.get(1)[index]).toEqual(population.get(1)[index])
                    } else {
                        expect(children.get(1)[index]).toEqual(population.get(0)[index])
                        expect(children.get(0)[index]).toEqual(population.get(1)[index])
                    }
                }
            })
        })
    })

    describe('one-point crossover', () => {
        const setupSpy = (crossoverPoint: number) => {
            random.and.returnValues(0, crossoverPoint)
        }

        it('should reverse values if crossoverPoint is population.genomeSize', () => {
            setupSpy(population.genomeSize)

            const children = crossover(population)

            expect(children.get(1)).toEqual(population.get(0))
            expect(children.get(0)).toEqual(population.get(1))
        })

        const points: number[] = [ 1, 2, 3, 7, 8 ]

        points.forEach(point => {
            it(`should crossover correctly with point ${point}`, () => {
                setupSpy(point)

                const children = crossover(population)

                for (let index = 0; index < population.genomeSize; index++) {
                    if (index >= point) {
                        expect(children.get(0)[index]).toEqual(population.get(0)[index])
                        expect(children.get(1)[index]).toEqual(population.get(1)[index])
                    } else {
                        expect(children.get(1)[index]).toEqual(population.get(0)[index])
                        expect(children.get(0)[index]).toEqual(population.get(1)[index])
                    }
                }
            })
        })
    })
})

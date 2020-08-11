import { Population } from '../../../src/genetic-algorithm/population'
import { rhythmicDispersionFactory } from '../../../src/genetic-algorithm/fitness/rhythmic-dispersion-factory'
import { Pitch } from '../../../src/common/pitch'
import { Uint8 } from '../../../src/common/uint8'

describe('rhythmicDispersion', () => {
    it('should return array same length as population', () => {
        const population = new Population({ size: 5, genomeSize: 4 })

        const results = rhythmicDispersionFactory({ target: 0 })(population)

        expect(results.length).toBe(population.size)
    })

    it('should have indexOfDispersion of 0 if all genes are Pitch.Hold', () => {
        const population = new Population({ size: 1, genomeSize: 3, geneFactory: () => Pitch.Hold })

        const result = rhythmicDispersionFactory({ target: 0 })(population)[0]

        expect(result).toBe(0)
    })

    it('should have indexOfDispersion of 0 if only one non-Hold gene', () => {
        const population = new Population({
            size: 1,
            genomeSize: 3,
            geneFactory: (i: number) => i ? Pitch.Hold : Pitch.C
        })

        const result = rhythmicDispersionFactory({ target: 0 })(population)[0]

        expect(result).toBe(0)
    })

    const testCases: { genome: Uint8[], target: 0 | 1 | 2, expected: number }[] = [
        {
            genome: [ Pitch.Rest, Pitch.C, Pitch.D, Pitch.A ],
            target: 0,
            expected: 0
        },
        {
            genome: [ Pitch.Rest, Pitch.C, Pitch.D, Pitch.A ],
            target: 1,
            expected: -33
        },
        {
            genome: [ Pitch.Rest, Pitch.C, Pitch.D, Pitch.A ],
            target: 2,
            expected: -100
        },
        {
            genome: [ Pitch.Rest, Pitch.Hold, Pitch.D, Pitch.Hold ],
            target: 0,
            expected: 0
        },
        {
            genome: [ Pitch.Rest, Pitch.Hold, Pitch.D, Pitch.E ],
            target: 0,
            expected: -6
        },
        {
            genome: [ Pitch.Rest, Pitch.Hold, Pitch.D, Pitch.E ],
            target: 1,
            expected: -25
        },
        {
            genome: [ Pitch.Rest, Pitch.Hold, Pitch.D, Pitch.E ],
            target: 2,
            expected: -88
        },
        {
            genome: [ Pitch.Rest, Pitch.Hold, Pitch.D, Pitch.E, Pitch.Hold, Pitch.Hold ],
            target: 0,
            expected: -13
        },
        {
            genome: [ Pitch.Rest, Pitch.Hold, Pitch.D, Pitch.E, Pitch.Hold, Pitch.Hold ],
            target: 1,
            expected: -17
        },
        {
            genome: [ Pitch.Rest, Pitch.Hold, Pitch.D, Pitch.E, Pitch.Hold, Pitch.Hold ],
            target: 2,
            expected: -75
        }
    ]

    testCases.forEach(({ genome, target, expected }) => {
        it(`should return ${expected} with target ${target} and genome ${genome}`, () => {
            const population = new Population({
                size: 1,
                genomeSize: genome.length,
                geneFactory: (i: number) => genome[i]
            })

            const result = rhythmicDispersionFactory({ target })(population)[0]

            expect(result).toBe(expected)
        })
    })
})

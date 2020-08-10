import { Population } from '../../../src/genetic-algorithm/population'
import { scaleIntervalFactory } from '../../../src/genetic-algorithm/fitness/scale-interval-factory'
import { Uint8 } from '../../../src/common/uint8'
import { Pitch } from '../../../src/common/pitch'

describe('scaleInterval', () => {
    it('should return array of same length as population', () => {
        const population = new Population({ size: 5, genomeSize: 5 })

        const result = scaleIntervalFactory({ scale: [], intervalScores: [] })(population)

        expect(result.length).toBe(population.size)
    })

    it('should return 0 if scale is empty', () => {
        const population = new Population({ size: 1, genomeSize: 4, geneFactory: (i: number) => i as Uint8 })

        const result = scaleIntervalFactory({ scale: [], intervalScores: [ 1, 2 ] })(population)[0]

        expect(result).toBe(0)
    })

    it('should return 0 if intervalScores is empty', () => {
        const population = new Population({ size: 1, genomeSize: 4, geneFactory: (i: number) => i as Uint8 })

        const result = scaleIntervalFactory({
            scale: [ Pitch.C, Pitch.Bb, Pitch.B ],
            intervalScores: []
        })(population)[0]

        expect(result).toBe(0)
    })

    it('should return 0 if all genes are rests or holds', () => {
        const population = new Population({
            size: 1,
            genomeSize: 6,
            geneFactory: (i: number) => i % 2 ? Pitch.Rest : Pitch.Hold
        })

        const result = scaleIntervalFactory({
            scale: [ Pitch.C, Pitch.Bb, Pitch.B ],
            intervalScores: [ 1, 2, 3 ]
        })(population)[0]

        expect(result).toBe(0)
    })

    it('should return 0 if all genes are rests or holds except 1', () => {
        const population = new Population({
            size: 1,
            genomeSize: 6,
            geneFactory: (i: number) => i % 2 ? Pitch.Rest : (!i ? Pitch.C : Pitch.Hold)
        })

        const result = scaleIntervalFactory({
            scale: [ Pitch.C, Pitch.Bb, Pitch.B ],
            intervalScores: [ 1, 2, 3 ]
        })(population)[0]

        expect(result).toBe(0)
    })

    it('should return 0 if no note is in scale', () => {
        const population = new Population({
            size: 1,
            genomeSize: 6,
            geneFactory: () => Pitch.Gb
        })

        const result = scaleIntervalFactory({
            scale: [ Pitch.C, Pitch.B, Pitch.A ],
            intervalScores: [ 1, 2, 3 ]
        })(population)[0]

        expect(result).toBe(0)
    })

    it('should return 0 if no two in-scale notes are adjacent', () => {
        const population = new Population({
            size: 1,
            genomeSize: 6,
            geneFactory: (i: number) => i % 2 ? Pitch.C : Pitch.Gb
        })

        const result = scaleIntervalFactory({
            scale: [ Pitch.C, Pitch.B, Pitch.A ],
            intervalScores: [ 1, 2, 3 ]
        })(population)[0]

        expect(result).toBe(0)
    })

    it('should return 0 if all intervalScores are 0 or undefined', () => {
        const population = new Population({
            size: 1,
            genomeSize: 6,
            geneFactory: (i: number) => i as Uint8
        })

        const result = scaleIntervalFactory({
            scale: [ Pitch.C, Pitch.Db, Pitch.D, Pitch.Eb ],
            intervalScores: [ 0, 0 ]
        })(population)[0]

        expect(result).toBe(0)
    })

    const cScale = [ Pitch.C, Pitch.D, Pitch.E, Pitch.F, Pitch.G, Pitch.A, Pitch.B ]
    const cScores = [ 9, 10, 10, 8, 7, 1, 1 ]
    const cases: {
        genome: Pitch[],
        scale: Pitch[],
        intervalScores: number[],
        expectedFitness: number
    }[] = [
        {
            genome: [ Pitch.C, Pitch.B ],
            scale: cScale,
            intervalScores: cScores,
            expectedFitness: 10
        },
        {
            genome: [ Pitch.C, Pitch.Hold, Pitch.B ],
            scale: cScale,
            intervalScores: cScores,
            expectedFitness: 10
        },
        {
            genome: [ Pitch.C, Pitch.Rest, Pitch.Rest, Pitch.Hold, Pitch.B ],
            scale: cScale,
            intervalScores: cScores,
            expectedFitness: 10
        },
        {
            genome: [ Pitch.C, Pitch.Rest, Pitch.B, Pitch.Rest, Pitch.A ],
            scale: cScale,
            intervalScores: cScores,
            expectedFitness: 55
        },
        {
            genome: [ Pitch.B, Pitch.A, Pitch.A, Pitch.B, Pitch.B, Pitch.Hold, Pitch.Rest ],
            scale: cScale,
            intervalScores: cScores,
            expectedFitness: 95
        },
        {
            genome: [ Pitch.B, Pitch.Rest, Pitch.A, Pitch.Hold, Pitch.A, Pitch.B, Pitch.B ],
            scale: cScale,
            intervalScores: cScores,
            expectedFitness: 95
        },
        {
            genome: [ Pitch.C, Pitch.D, Pitch.E, Pitch.F, Pitch.G, Pitch.A, Pitch.B ],
            scale: cScale,
            intervalScores: cScores,
            expectedFitness: 100
        },
        {
            genome: [ Pitch.C, Pitch.Bb, Pitch.B, Pitch.Db, Pitch.B, Pitch.D ],
            scale: cScale,
            intervalScores: cScores,
            expectedFitness: 2
        }
    ]

    cases.forEach(({ genome, scale, intervalScores, expectedFitness }) => {
        it(`should return ${expectedFitness} for ${genome} with scale ${scale}` +
            ` and intervalScores ${intervalScores}`, () => {
                const population = new Population({
                    size: 1,
                    genomeSize: genome.length,
                    geneFactory: (i: number) => genome[i]
                })

                const result = scaleIntervalFactory({
                    scale,
                    intervalScores
                })(population)[0]

                expect(result).toBe(expectedFitness)
        })
    })
})

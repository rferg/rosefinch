import { Population } from '../../../src/genetic-algorithm/population'
import { pitchSequenceDirectionFactory } from '../../../src/genetic-algorithm/fitness/pitch-sequence-direction-factory'
import { Pitch } from '../../../src/common/pitch'
import { Uint8 } from '../../../src/common/uint8'

describe('pitchSequenceDirection', () => {
    it('should return array same length as population', () => {
        const population = new Population({ size: 4, genomeSize: 4 })

        const results = pitchSequenceDirectionFactory({
            sequenceLength: 3,
            scores: { ascending: 1, stable: 1, descending: 1 }
        })(population)

        expect(results.length).toBe(population.size)
    })

    it('should return 0 if genomeSize is less than sequence length', () => {
        const population = new Population({ size: 1, genomeSize: 3 })

        const result = pitchSequenceDirectionFactory({
            sequenceLength: population.genomeSize + 1,
            scores: { ascending: 1, stable: 1, descending: 1 }
        })(population)[0]

        expect(result).toBe(0)
    })

    it('should return 0 if number of non-Hold/Rest notes are less than sequence length', () => {
        const population = new Population({
            size: 1,
            genomeSize: 6,
            geneFactory: (i: number) => i % 2 ? Pitch.Rest : Pitch.Hold
        })

        const result = pitchSequenceDirectionFactory({
            sequenceLength: population.genomeSize - 1,
            scores: { ascending: 1, stable: 1, descending: 1 }
        })(population)[0]

        expect(result).toBe(0)
    })

    it('should return 0 if all sequence scores are 0', () => {
        const population = new Population({ size: 1, genomeSize: 4 })

        const result = pitchSequenceDirectionFactory({
            sequenceLength: 3,
            scores: { ascending: 0, stable: 0, descending: 0 }
        })(population)[0]

        expect(result).toBe(0)
    });

    [ -1, 0, 1 ].forEach(sequenceLength => {
        it(`should change sequenceLength of ${sequenceLength} to 2`, () => {
            const population = new Population({ size: 1, genomeSize: 2, geneFactory: () => Pitch.C })

            const result = pitchSequenceDirectionFactory({
                sequenceLength,
                scores: { ascending: 0, stable: 1, descending: 0 }
            })(population)[0]

            expect(result).toBe(100)
        })
    })

    it('should return 0 if no sequence of length=sequenceLength has consistent direction', () => {
        const population = new Population({
            size: 1,
            genomeSize: 6,
            geneFactory: (i: number) => i % 2 ? Pitch.C : Pitch.Db
        })

        const result = pitchSequenceDirectionFactory({
            sequenceLength: 3,
            scores: { ascending: 1, stable: 1, descending: 1 }
        })(population)[0]

        expect(result).toBe(0)
    })

    it('should recognize ascending sequence', () => {
        const population = new Population({
            size: 1,
            genomeSize: 3,
            geneFactory: (i: number) => i + 1 as Uint8
        })

        const result = pitchSequenceDirectionFactory({
            sequenceLength: 3,
            scores: { ascending: 1, stable: 0, descending: 0 }
        })(population)[0]

        expect(result).toBe(100)
    })

    it('should recognize stable sequence', () => {
        const population = new Population({
            size: 1,
            genomeSize: 3,
            geneFactory: () => Pitch.C
        })

        const result = pitchSequenceDirectionFactory({
            sequenceLength: 3,
            scores: { ascending: 0, stable: 1, descending: 0 }
        })(population)[0]

        expect(result).toBe(100)
    })

    it('should recognize stable sequence', () => {
        const population = new Population({
            size: 1,
            genomeSize: 3,
            geneFactory: (i: number) => Pitch.B - i as Uint8
        })

        const result = pitchSequenceDirectionFactory({
            sequenceLength: 3,
            scores: { ascending: 0, stable: 0, descending: 1 }
        })(population)[0]

        expect(result).toBe(100)
    })

    const testCases: {
        genome: Uint8[],
        sequenceLength: number,
        scores: { ascending: number, stable: number, descending: number },
        expected: number
    }[] = [
        {
            genome: [ 15, Pitch.Rest * (Pitch.Hold + 1) as Uint8, 12, Pitch.Hold, 9 ],
            sequenceLength: 3,
            scores: { ascending: 0, stable: 0, descending: 1 },
            expected: 100
        },
        {
            genome: [ Pitch.B, Pitch.Bb, Pitch.A, Pitch.Ab, Pitch.Ab ],
            sequenceLength: 3,
            scores: { ascending: 0, stable: 0, descending: 1 },
            expected: 67
        },
        {
            genome: [ Pitch.B, Pitch.Bb, Pitch.A, Pitch.Ab, Pitch.Ab ],
            sequenceLength: 3,
            scores: { ascending: 2, stable: 1, descending: 2 },
            expected: 67
        },
        {
            genome: [ Pitch.A, Pitch.A, Pitch.Bb, Pitch.Rest, Pitch.C, Pitch.Eb, Pitch.Gb, Pitch.Gb, Pitch.Gb ],
            sequenceLength: 3,
            scores: { ascending: 2, stable: 1, descending: 2 },
            expected: 25
        },
        {
            genome: [ Pitch.C, Pitch.D, Pitch.E, Pitch.E ],
            sequenceLength: 4,
            scores: { ascending: 1, stable: 1, descending: 1 },
            expected: 0
        },
        {
            genome: [ Pitch.C, Pitch.D, Pitch.E, Pitch.F, Pitch.E, Pitch.D, Pitch.C ],
            sequenceLength: 4,
            scores: { ascending: 1, stable: 1, descending: 1 },
            expected: 50
        }
    ]

    const formatScores = (scores: { [key: string]: number }) =>
        Object.keys(scores).map(key => `${key}:${scores[key]}`).join(',')

    testCases.forEach(({ genome, sequenceLength, scores, expected }) => {
        it(`should return ${expected} with genome ${genome}, sequenceLength` +
            ` ${sequenceLength}, and scores {${formatScores(scores)}}`, () => {
            const population = new Population({
                size: 1,
                genomeSize: genome.length,
                geneFactory: (i: number) => genome[i]
            })

            const result = pitchSequenceDirectionFactory({
                sequenceLength,
                scores
            })(population)[0]

            expect(result).toBe(expected)
        })
    })
})

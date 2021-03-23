import { Pitch } from '../../../src/common/pitch'
import { Uint8 } from '../../../src/common/uint8'
import { Population, RepeatedSequenceType } from '../../../src/genetic-algorithm'
import { repeatedSequencesFactory } from '../../../src/genetic-algorithm/fitness/repeated-sequences-factory'

describe('repeatedSequences', () => {
    it('should return array same length as population', () => {
        const size = 5
        const population = new Population({ size, genomeSize: 4 })

        const result = repeatedSequencesFactory([])(population)

        expect(result.length).toEqual(population.size)
    })

    it('should return all 0s if options array is empty', () => {
        const population = new Population({ size: 5, genomeSize: 4 })

        const result = repeatedSequencesFactory([])(population)

        expect(result.every(f => f === 0)).toBeTrue()
    })

    it('should throw if a minLength is less than 2', () => {
        const population = new Population({ size: 5, genomeSize: 4 })

        expect(() => repeatedSequencesFactory([ {
            minLength: 1,
            type: RepeatedSequenceType.Rhythm
        } ])(population)).toThrowError(/must be >= 2/)
    })

    it('should throw if minLength is > half of genome size', () => {
        const genomeSize = 4
        const population = new Population({ size: 5, genomeSize })

        expect(() => repeatedSequencesFactory([ {
            minLength: (genomeSize / 2) + 1,
            type: RepeatedSequenceType.Rhythm
        } ])(population)).toThrowError(/minLength cannot be > half of genomeSize/)
    })

    const cases: {
        genome: number[],
        minLength: number,
        expectedPitchScore: number,
        expectedRhythmScore: number
    }[] = [
        {
            genome: [ 1, 1, 1, 1 ],
            minLength: 2,
            expectedPitchScore: 100,
            expectedRhythmScore: 100
        },
        {
            genome: [ 1, 2, 3, Pitch.Hold, 1, 2, Pitch.Hold, 3 ],
            minLength: 3,
            expectedPitchScore: 25,
            expectedRhythmScore: 28
        },
        {
            genome: [ 1, 0, 3, 0, 3, 0 ],
            minLength: 2,
            expectedPitchScore: 36,
            expectedRhythmScore: 100
        },
        {
            genome: [ 1, 0, 3, 0, 3, 0 ],
            minLength: 3,
            expectedPitchScore: 25,
            expectedRhythmScore: 100
        },
        {
            genome: [ 1, Pitch.Hold, 0, 3, Pitch.Hold, Pitch.Hold, 0, 3, Pitch.Hold, Pitch.Hold, 0 ],
            minLength: 2,
            expectedPitchScore: 36,
            expectedRhythmScore: 30
        },
        {
            genome: [ 1, Pitch.Hold, 0, 3, Pitch.Hold, Pitch.Hold, 0, 3, Pitch.Hold, Pitch.Hold, 0 ],
            minLength: 4,
            expectedPitchScore: 0,
            expectedRhythmScore: 18
        },
        {
            genome: [ 1, 3, 1, 4, 0, 0, 7, 0, 0, 1, 3, 1, 6 ],
            minLength: 2,
            expectedPitchScore: 9,
            expectedRhythmScore: 100
        },
        {
            genome: [ 1, 3, 1, 4, 0, 0, 7, 0, 0, 1, 3, 1, 6 ],
            minLength: 3,
            expectedPitchScore: 4,
            expectedRhythmScore: 100
        },
        {
            genome: [
                Pitch.Hold, 1, Pitch.Hold, 3, Pitch.Hold, 1, 4, 0, 0, 7, 0, 0, 1, 3, Pitch.Hold, 1, Pitch.Hold, 6
            ],
            minLength: 3,
            expectedPitchScore: 4,
            expectedRhythmScore: 31
        }
    ]

    cases.forEach(({ genome, minLength, expectedPitchScore, expectedRhythmScore }) => {
        it(`should return ${expectedPitchScore} for sequence type Pitch, minLength ${minLength}` +
            ` and genome: ${genome.join(',')}`, () => {
            const population = new Population({
                size: 1,
                genomeSize: genome.length,
                geneFactory: i => genome[i] as Uint8
            })

            const result = repeatedSequencesFactory([ {
                minLength,
                type: RepeatedSequenceType.Pitch
            } ])(population)

            expect(result[0]).toEqual(expectedPitchScore)
        })

        it(`should return ${expectedRhythmScore} for sequence type Rhythm, minLength ${minLength}` +
            ` and genome: ${genome.join(',')}`, () => {
            const population = new Population({
                size: 1,
                genomeSize: genome.length,
                geneFactory: i => genome[i] as Uint8
            })

            const result = repeatedSequencesFactory([ {
                minLength,
                type: RepeatedSequenceType.Rhythm
            } ])(population)

            expect(result[0]).toEqual(expectedRhythmScore)
        })

        const expectedCombinedScore = Math.round((expectedRhythmScore / 2) + (expectedPitchScore / 2))

        it(
            `should return ${expectedCombinedScore} for sequence types ` +
            `Rhythm and Pitch and genome: ${genome.join(',')}`,
            () => {
                const population = new Population({
                    size: 1,
                    genomeSize: genome.length,
                    geneFactory: i => genome[i] as Uint8
                })

                const result = repeatedSequencesFactory(
                    [
                        {
                            minLength,
                            type: RepeatedSequenceType.Rhythm
                        },
                        {
                            minLength,
                            type: RepeatedSequenceType.Pitch
                        }
                    ])(population)

                expect(Math.abs(result[0] - expectedCombinedScore)).toBeLessThanOrEqual(1)
        })
    })
})

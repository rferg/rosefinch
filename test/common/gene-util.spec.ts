import { GeneUtil } from '../../src/common/gene-util'
import { Pitch } from '../../src/common/pitch'
import { Uint8 } from '../../src/common/uint8'

describe('GeneUtil', () => {
    describe('getPitch', () => {
        it('should return Hold if gene is 255', () => {
            expect(GeneUtil.getPitch(255)).toBe(Pitch.Hold)
        })

        const testGenes: {gene: Uint8, expected: Pitch }[] = [
            { gene: 0, expected: Pitch.Rest },
            { gene: 2, expected: Pitch.Db },
            { gene: 12, expected: Pitch.B },
            { gene: 13, expected: Pitch.Rest },
            { gene: 14, expected: Pitch.C },
            { gene: 65, expected: Pitch.Rest },
            { gene: 71, expected: Pitch.F },
            { gene: 87, expected: Pitch.Ab }
        ]

        testGenes.forEach(({ gene, expected }) => {
            it(`it should return ${expected} given ${gene}`, () => {
                expect(GeneUtil.getPitch(gene)).toBe(expected)
            })
        })
    })

    describe('getOctave', () => {
        it('should return MIN_OCTAVE - 1 given a Hold gene', () => {
            expect(GeneUtil.getOctave(255)).toBe(GeneUtil.MIN_OCTAVE - 1)
        })

        const testGenes: { gene: Uint8, expected: number }[] = [
            { gene: 0, expected: 0 },
            { gene: 13, expected: 1 },
            { gene: 65, expected: 5 },
            { gene: 12, expected: 0 },
            { gene: 14, expected: 1 },
            { gene: 71, expected: 5 },
            { gene: 87, expected: 6 },
            { gene: (Pitch.Hold - 1) as Uint8, expected: GeneUtil.MAX_OCTAVE }
        ]

        testGenes.forEach(({ gene, expected }) => {
            it(`should return ${expected} given ${gene}`, () => {
                expect(GeneUtil.getOctave(gene)).toBe(expected)
            })
        })
    })

    describe('convertToGene', () => {
        it('should return Hold gene given Pitch.Hold', () => {
            expect(GeneUtil.convertToGene(Pitch.Hold, 1)).toBe(Pitch.Hold)
            expect(GeneUtil.convertToGene(Pitch.Hold, -1)).toBe(Pitch.Hold)
            expect(GeneUtil.convertToGene(Pitch.Hold, 12)).toBe(Pitch.Hold)
        })

        const tests: { pitch: Pitch, octave: number, expected: Uint8 }[] = [
            { pitch: Pitch.Rest, octave: 2, expected: 26 },
            { pitch: Pitch.Rest, octave: 0, expected: 0 },
            { pitch: Pitch.Rest, octave: 8, expected: 104 },
            { pitch: Pitch.Rest, octave: GeneUtil.MAX_OCTAVE + 1, expected: 104 },
            { pitch: Pitch.C, octave: 0, expected: 1 },
            { pitch: Pitch.C, octave: 2, expected: 27 },
            { pitch: Pitch.C, octave: 5, expected: 66 },
            { pitch: Pitch.F, octave: 5, expected: 71 },
            { pitch: Pitch.F, octave: 8, expected: 110 },
            { pitch: Pitch.B, octave: 8, expected: 116 },
            { pitch: Pitch.B, octave: GeneUtil.MAX_OCTAVE + 1, expected: 116 },
            { pitch: Pitch.B, octave: 0, expected: 12 },
            { pitch: Pitch.Db, octave: 0, expected: 2 },
            { pitch: Pitch.Db, octave: 6, expected: 80 }
        ]

        tests.forEach(({ pitch, octave, expected }) => {
            it(`should return ${expected} given pitch: ${pitch}, octave: ${octave}`, () => {
                expect(GeneUtil.convertToGene(pitch, octave)).toBe(expected)
            })

            it(`should agree with getPitch and getOctave for pitch: ${pitch}, octave: ${octave}`,
                () => {
                    const actual = GeneUtil.convertToGene(pitch, octave)
                    const expectedOctave = Math.max(Math.min(octave, GeneUtil.MAX_OCTAVE), GeneUtil.MIN_OCTAVE)
                    expect(GeneUtil.getOctave(actual)).toBe(expectedOctave)
                    expect(GeneUtil.getPitch(actual)).toBe(pitch)
                })
        })
    })
})

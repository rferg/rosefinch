import { GeneUtil } from '../../src/common/gene-util'
import { Pitch } from '../../src/common/pitch'
import { Uint8 } from '../../src/common/uint8'

describe('GeneUtil', () => {
    const octaveLength = Pitch.Hold + 1 as Uint8
    describe('getPitch', () => {
        const testGenes: {gene: Uint8, expected: Pitch }[] = [
            { gene: Pitch.Rest, expected: Pitch.Rest },
            { gene: Pitch.Db, expected: Pitch.Db },
            { gene: Pitch.B, expected: Pitch.B },
            { gene: octaveLength, expected: Pitch.Rest },
            { gene: Pitch.Hold, expected: Pitch.Hold },
            { gene: (octaveLength + Pitch.C) as Uint8, expected: Pitch.C },
            { gene: (octaveLength * 5) as Uint8, expected: Pitch.Rest },
            { gene: ((octaveLength * 5) + Pitch.F) as Uint8, expected: Pitch.F },
            { gene: ((octaveLength * 6) + Pitch.Ab) as Uint8, expected: Pitch.Ab }
        ]

        testGenes.forEach(({ gene, expected }) => {
            it(`it should return ${expected} given ${gene}`, () => {
                expect(GeneUtil.getPitch(gene)).toBe(expected)
            })
        })
    })

    describe('getOctave', () => {
        const testGenes: { gene: Uint8, expected: number }[] = [
            { gene: 0, expected: 0 },
            { gene: octaveLength, expected: 1 },
            { gene: (octaveLength * 5) as Uint8, expected: 5 },
            { gene: (octaveLength - 2) as Uint8, expected: 0 },
            { gene: (octaveLength + 1) as Uint8, expected: 1 },
            { gene: (octaveLength * 5) + 6 as Uint8, expected: 5 },
            { gene: (octaveLength * 6) + 3 as Uint8, expected: 6 },
            { gene: GeneUtil.MAX_NOTE_VALUE, expected: GeneUtil.MAX_OCTAVE }
        ]

        testGenes.forEach(({ gene, expected }) => {
            it(`should return ${expected} given ${gene}`, () => {
                expect(GeneUtil.getOctave(gene)).toBe(expected)
            })
        })
    })

    describe('convertToGene', () => {
        const tests: { pitch: Pitch, octave: number, expected: Uint8 }[] = [
            { pitch: Pitch.Rest, octave: 2, expected: octaveLength * 2 as Uint8 },
            { pitch: Pitch.Rest, octave: 0, expected: 0 },
            { pitch: Pitch.Rest, octave: 8, expected: octaveLength * 8 as Uint8 },
            {
                pitch: Pitch.Rest,
                octave: GeneUtil.MAX_OCTAVE + 1,
                expected: octaveLength * GeneUtil.MAX_OCTAVE as Uint8 },
            { pitch: Pitch.C, octave: 0, expected: 1 },
            { pitch: Pitch.C, octave: 2, expected: (octaveLength * 2) + Pitch.C as Uint8 },
            { pitch: Pitch.C, octave: 5, expected: (octaveLength * 5) + Pitch.C as Uint8 },
            { pitch: Pitch.F, octave: 5, expected: (octaveLength * 5) + Pitch.F as Uint8 },
            { pitch: Pitch.F, octave: 8, expected: (octaveLength * 8) + Pitch.F as Uint8 },
            { pitch: Pitch.B, octave: 8, expected: (octaveLength * 8) + Pitch.B as Uint8 },
            {
                pitch: Pitch.B,
                octave: GeneUtil.MAX_OCTAVE + 1,
                expected: (octaveLength * GeneUtil.MAX_OCTAVE) + Pitch.B as Uint8
            },
            { pitch: Pitch.B, octave: 0, expected: Pitch.B },
            { pitch: Pitch.Db, octave: 0, expected: Pitch.Db },
            { pitch: Pitch.Db, octave: 6, expected: (octaveLength * 6) + Pitch.Db as Uint8 }
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

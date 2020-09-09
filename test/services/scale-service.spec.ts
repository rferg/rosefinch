import { Scale, ScaleService } from '../../src/services'
import { Pitch } from '../../src/common/pitch'

describe('ScaleService', () => {
    let service: ScaleService

    beforeEach(() => {
        service = new ScaleService()
    })

    it('should return empty if root is Rest', () => {
        expect(service.getPitches(Pitch.Rest, Scale.Major).length).toBe(0)
    })

    it('should return empty if root is Hold', () => {
        expect(service.getPitches(Pitch.Hold, Scale.Major).length).toBe(0)
    })

    const cases: { root: Pitch, scale: Scale, expected: Pitch[] }[] = [
        {
            root: Pitch.C,
            scale: Scale.Major,
            expected: [ Pitch.C, Pitch.D, Pitch.E, Pitch.F, Pitch.G, Pitch.A, Pitch.B ]
        },
        {
            root: Pitch.Eb,
            scale: Scale.Major,
            expected: [ Pitch.Eb, Pitch.F, Pitch.G, Pitch.Ab, Pitch.Bb, Pitch.C, Pitch.D ]
        },
        {
            root: Pitch.A,
            scale: Scale.Major,
            expected: [ Pitch.A, Pitch.B, Pitch.Db, Pitch.D, Pitch.E, Pitch.Gb, Pitch.Ab ]
        },
        {
            root: Pitch.C,
            scale: Scale.NaturalMinor,
            expected: [ Pitch.C, Pitch.D, Pitch.Eb, Pitch.F, Pitch.G, Pitch.Ab, Pitch.Bb ]
        },
        {
            root: Pitch.Eb,
            scale: Scale.NaturalMinor,
            expected: [ Pitch.Eb, Pitch.F, Pitch.Gb, Pitch.Ab, Pitch.Bb, Pitch.B, Pitch.Db ]
        },
        {
            root: Pitch.A,
            scale: Scale.NaturalMinor,
            expected: [ Pitch.A, Pitch.B, Pitch.C, Pitch.D, Pitch.E, Pitch.F, Pitch.G ]
        },
        {
            root: Pitch.B,
            scale: Scale.Chromatic,
            expected: [
                Pitch.B,
                Pitch.C,
                Pitch.Db,
                Pitch.D,
                Pitch.Eb,
                Pitch.E,
                Pitch.F,
                Pitch.Gb,
                Pitch.G,
                Pitch.Ab,
                Pitch.A,
                Pitch.Bb
            ]
        },
        {
            root: Pitch.Eb,
            scale: Scale.Dorian,
            expected: [ Pitch.Eb, Pitch.F, Pitch.Gb, Pitch.Ab, Pitch.Bb, Pitch.C, Pitch.Db ]
        },
        {
            root: Pitch.Eb,
            scale: Scale.Phrygian,
            expected: [ Pitch.Eb, Pitch.E, Pitch.Gb, Pitch.Ab, Pitch.Bb, Pitch.B, Pitch.Db ]
        },
        {
            root: Pitch.Eb,
            scale: Scale.Lydian,
            expected: [ Pitch.Eb, Pitch.F, Pitch.G, Pitch.A, Pitch.Bb, Pitch.C, Pitch.D ]
        },
        {
            root: Pitch.Eb,
            scale: Scale.Mixolydian,
            expected: [ Pitch.Eb, Pitch.F, Pitch.G, Pitch.Ab, Pitch.Bb, Pitch.C, Pitch.Db ]
        },
        {
            root: Pitch.Eb,
            scale: Scale.Aeolian,
            expected: [ Pitch.Eb, Pitch.F, Pitch.Gb, Pitch.Ab, Pitch.Bb, Pitch.B, Pitch.Db ]
        },
        {
            root: Pitch.Eb,
            scale: Scale.Locrian,
            expected: [ Pitch.Eb, Pitch.E, Pitch.Gb, Pitch.Ab, Pitch.A, Pitch.B, Pitch.Db ]
        },
        {
            root: Pitch.G,
            scale: Scale.MinorPentatonic,
            expected: [ Pitch.G, Pitch.Bb, Pitch.C, Pitch.D, Pitch.F ]
        },
        {
            root: Pitch.G,
            scale: Scale.MajorPentatonic,
            expected: [ Pitch.G, Pitch.A, Pitch.B, Pitch.D, Pitch.E ]
        },
        {
            root: Pitch.G,
            scale: Scale.PhrygianDominant,
            expected: [ Pitch.G, Pitch.Ab, Pitch.B, Pitch.C, Pitch.D, Pitch.Eb, Pitch.F ]
        }
    ]

    cases.forEach(({ root, scale, expected }) => {
        it(`should return ${expected} with root ${root} and scale ${scale}`, () => {
            expect(service.getPitches(root, scale)).toEqual(expected)
        })
    })
})

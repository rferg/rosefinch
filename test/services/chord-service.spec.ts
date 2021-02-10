import { GeneUtil } from '../../src/common/gene-util'
import { Pitch } from '../../src/common/pitch'
import { ChordName } from '../../src/services/chord-name'
import { ChordService } from '../../src/services/chord-service'

const octave = GeneUtil.OCTAVE_LENGTH

describe('ChordService', () => {
    let service: ChordService

    beforeEach(() => {
        service = new ChordService()
    })

    it('should return empty if root is Rest', () => {
        expect(service.getPitches(Pitch.Rest, ChordName.MajorSeventh).length).toBe(0)
    })

    it('should return empty if root is Hold', () => {
        expect(service.getPitches(Pitch.Hold, ChordName.MajorSeventh).length).toBe(0)
    })

    const cases: { root: Pitch, chord: ChordName, expected: Pitch[] }[] = [
        {
            root: Pitch.C,
            chord: ChordName.Major,
            expected: [ Pitch.C, Pitch.E, Pitch.G ]
        },
        {
            root: Pitch.Eb,
            chord: ChordName.Major,
            expected: [ Pitch.Eb, Pitch.G, Pitch.Bb ]
        },
        {
            root: Pitch.A,
            chord: ChordName.Major,
            expected: [ Pitch.A, Pitch.Db + octave, Pitch.E + octave ]
        },
        {
            root: Pitch.C,
            chord: ChordName.Minor,
            expected: [ Pitch.C, Pitch.Eb, Pitch.G ]
        },
        {
            root: Pitch.Eb,
            chord: ChordName.Minor,
            expected: [ Pitch.Eb, Pitch.Gb, Pitch.Bb ]
        },
        {
            root: Pitch.A,
            chord: ChordName.Minor,
            expected: [ Pitch.A, Pitch.C + octave, Pitch.E + octave ]
        },
        {
            root: Pitch.C,
            chord: ChordName.Diminished,
            expected: [ Pitch.C, Pitch.Eb, Pitch.Gb ]
        },
        {
            root: Pitch.Eb,
            chord: ChordName.Diminished,
            expected: [ Pitch.Eb, Pitch.Gb, Pitch.A ]
        },
        {
            root: Pitch.A,
            chord: ChordName.Diminished,
            expected: [ Pitch.A, Pitch.C + octave, Pitch.Eb + octave ]
        },
        {
            root: Pitch.C,
            chord: ChordName.MajorSeventh,
            expected: [ Pitch.C, Pitch.E, Pitch.G, Pitch.B ]
        },
        {
            root: Pitch.Eb,
            chord: ChordName.MajorSeventh,
            expected: [ Pitch.Eb, Pitch.G, Pitch.Bb, Pitch.D + octave ]
        },
        {
            root: Pitch.A,
            chord: ChordName.MajorSeventh,
            expected: [ Pitch.A, Pitch.Db + octave, Pitch.E + octave, Pitch.Ab + octave ]
        },
        {
            root: Pitch.C,
            chord: ChordName.DominantSeventh,
            expected: [ Pitch.C, Pitch.E, Pitch.G, Pitch.Bb ]
        },
        {
            root: Pitch.Eb,
            chord: ChordName.DominantSeventh,
            expected: [ Pitch.Eb, Pitch.G, Pitch.Bb, Pitch.Db + octave ]
        },
        {
            root: Pitch.A,
            chord: ChordName.DominantSeventh,
            expected: [ Pitch.A, Pitch.Db + octave, Pitch.E + octave, Pitch.G + octave ]
        },
        {
            root: Pitch.C,
            chord: ChordName.MinorSeventh,
            expected: [ Pitch.C, Pitch.Eb, Pitch.G, Pitch.Bb ]
        },
        {
            root: Pitch.Eb,
            chord: ChordName.MinorSeventh,
            expected: [ Pitch.Eb, Pitch.Gb, Pitch.Bb, Pitch.Db + octave ]
        },
        {
            root: Pitch.A,
            chord: ChordName.MinorSeventh,
            expected: [ Pitch.A, Pitch.C + octave, Pitch.E + octave, Pitch.G + octave ]
        },
        {
            root: Pitch.C,
            chord: ChordName.MinorSeventhFlatFive,
            expected: [ Pitch.C, Pitch.Eb, Pitch.Gb, Pitch.Bb ]
        },
        {
            root: Pitch.Eb,
            chord: ChordName.MinorSeventhFlatFive,
            expected: [ Pitch.Eb, Pitch.Gb, Pitch.A, Pitch.Db + octave ]
        },
        {
            root: Pitch.A,
            chord: ChordName.MinorSeventhFlatFive,
            expected: [ Pitch.A, Pitch.C + octave, Pitch.Eb + octave, Pitch.G + octave ]
        }
    ]

    cases.forEach(({ root, chord, expected }) => {
        it(`should return ${expected} with root ${root} and chord ${chord}`, () => {
            expect(service.getPitches(root, chord)).toEqual(expected)
        })
    })
})

import { GeneUtil } from '../../src/common/gene-util'
import { Pitch } from '../../src/common/pitch'
import { GenomeConverterService } from '../../src/services/genome-converter-service'
import { PlayableChord } from '../../src/services/playable-chord'
import { PlayableNote } from '../../src/services/playable-note'

describe('GenomeConverterService', () => {
    let service: GenomeConverterService

    beforeEach(() => {
        service = new GenomeConverterService()
    })

    describe('convertGenesToPlayableSequence', () => {
        it('should return empty if given empty array', () => {
            const result = service.convertGenesToPlayableSequence([])

            expect(result.length).toBe(0)
        })

        it('should return same length array if no holds', () => {
            const genes = [ Pitch.C, Pitch.Rest, Pitch.D, Pitch.Db ]

            const result = service.convertGenesToPlayableSequence(genes)

            expect(result.length).toBe(genes.length)
        })

        const cases: { genes: number[], expected: PlayableNote[] }[] = [
            {
                genes: [
                    Pitch.C + GeneUtil.OCTAVE_LENGTH * 4,
                    Pitch.Hold + GeneUtil.OCTAVE_LENGTH,
                    Pitch.Hold + GeneUtil.OCTAVE_LENGTH * 2,
                    Pitch.Rest
                ],
                expected: [
                    {
                        pitch: Pitch.C,
                        pitchName: Pitch[Pitch.C],
                        octave: 4,
                        numberOfShortestDurations: 3
                    },
                    {
                        pitch: Pitch.Rest,
                        pitchName: Pitch[Pitch.Rest],
                        octave: 0,
                        numberOfShortestDurations: 1
                    }
                ]
            },
            {
                genes: [
                    Pitch.Hold,
                    Pitch.Hold,
                    Pitch.Rest
                ],
                expected: [
                    {
                        pitch: Pitch.Rest,
                        pitchName: Pitch[Pitch.Rest],
                        octave: 0,
                        numberOfShortestDurations: 1
                    }
                ]
            },
            {
                genes: [
                    Pitch.C + GeneUtil.OCTAVE_LENGTH,
                    Pitch.D + GeneUtil.OCTAVE_LENGTH * 2,
                    Pitch.Rest
                ],
                expected: [
                    {
                        pitch: Pitch.C,
                        pitchName: Pitch[Pitch.C],
                        octave: 1,
                        numberOfShortestDurations: 1
                    },
                    {
                        pitch: Pitch.D,
                        pitchName: Pitch[Pitch.D],
                        octave: 2,
                        numberOfShortestDurations: 1
                    },
                    {
                        pitch: Pitch.Rest,
                        pitchName: Pitch[Pitch.Rest],
                        octave: 0,
                        numberOfShortestDurations: 1
                    }
                ]
            },
            {
                genes: [
                    Pitch.C + GeneUtil.OCTAVE_LENGTH,
                    Pitch.Hold,
                    Pitch.D + GeneUtil.OCTAVE_LENGTH * 2,
                    Pitch.Hold,
                    Pitch.Rest,
                    Pitch.Hold
                ],
                expected: [
                    {
                        pitch: Pitch.C,
                        pitchName: Pitch[Pitch.C],
                        octave: 1,
                        numberOfShortestDurations: 2
                    },
                    {
                        pitch: Pitch.D,
                        pitchName: Pitch[Pitch.D],
                        octave: 2,
                        numberOfShortestDurations: 2
                    },
                    {
                        pitch: Pitch.Rest,
                        pitchName: Pitch[Pitch.Rest],
                        octave: 0,
                        numberOfShortestDurations: 2
                    }
                ]
            }
        ]

        cases.forEach(({ genes, expected }) => {
            it(`should return ${expected} if given ${genes}`, () => {
                const result = service.convertGenesToPlayableSequence(genes)

                expect(result).toEqual(expected)
            })
        })
    })

    describe('convertChordsToPlayableSequence', () => {
        it('should return empty if given empty array', () => {
            const result = service.convertChordsToPlayableSequence([])

            expect(result.length).toBe(0)
        })

        it('should return same length array if no holds', () => {
            const chords = [ [ Pitch.C ], [ Pitch.Rest ], [ Pitch.D ], [ Pitch.Db ] ]

            const result = service.convertChordsToPlayableSequence(chords)

            expect(result.length).toBe(chords.length)
        })

        const cases: { chords: number[][], expected: PlayableChord[] }[] = [
            {
                chords: [
                    [ Pitch.C + GeneUtil.OCTAVE_LENGTH * 4 ],
                    [ Pitch.Hold + GeneUtil.OCTAVE_LENGTH ],
                    [ Pitch.Hold + GeneUtil.OCTAVE_LENGTH * 2 ],
                    [ Pitch.Rest ]
                ],
                expected: [
                    {
                        pitches: [ Pitch.C ],
                        pitchNames: [ Pitch[Pitch.C] ],
                        octaves: [ 4 ],
                        numberOfShortestDurations: 3
                    },
                    {
                        pitches: [ Pitch.Rest ],
                        pitchNames: [ Pitch[Pitch.Rest] ],
                        octaves: [ 0 ],
                        numberOfShortestDurations: 1
                    }
                ]
            },
            {
                chords: [
                    [ Pitch.Hold ],
                    [ Pitch.Hold ],
                    [ Pitch.Rest ]
                ],
                expected: [
                    {
                        pitches: [ Pitch.Rest ],
                        pitchNames: [ Pitch[Pitch.Rest] ],
                        octaves: [ 0 ],
                        numberOfShortestDurations: 1
                    }
                ]
            },
            {
                chords: [
                    [
                        Pitch.C + GeneUtil.OCTAVE_LENGTH * 4,
                        Pitch.E + GeneUtil.OCTAVE_LENGTH * 4,
                        Pitch.A + GeneUtil.OCTAVE_LENGTH * 4
                    ],
                    [ Pitch.Hold ],
                    [ Pitch.Hold ],
                    [ Pitch.Rest ]
                ],
                expected: [
                    {
                        pitches: [ Pitch.C, Pitch.E, Pitch.A ],
                        pitchNames: [ Pitch[Pitch.C], Pitch[Pitch.E], Pitch[Pitch.A] ],
                        octaves: [ 4, 4, 4 ],
                        numberOfShortestDurations: 3
                    },
                    {
                        pitches: [ Pitch.Rest ],
                        pitchNames: [ Pitch[Pitch.Rest] ],
                        octaves: [ 0 ],
                        numberOfShortestDurations: 1
                    }
                ]
            }
        ]

        cases.forEach(({ chords, expected }) => {
            it(`should return ${expected} if given ${chords}`, () => {
                const result = service.convertChordsToPlayableSequence(chords)

                expect(result).toEqual(expected)
            })
        })
    })
})

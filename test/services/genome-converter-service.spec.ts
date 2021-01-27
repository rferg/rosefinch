import { GeneUtil } from '../../src/common/gene-util'
import { Pitch } from '../../src/common/pitch'
import { GenomeConverterService } from '../../src/services/genome-converter-service'
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
})

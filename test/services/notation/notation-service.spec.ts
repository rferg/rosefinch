import { AbcClickListener } from 'abcjs'
import { GeneUtil } from '../../../src/common/gene-util'
import { Pitch } from '../../../src/common/pitch'
import { CrossoverMethod, MutationMethod, SelectionMethod, SerializedGeneticAlgorithmOptions } from '../../../src/genetic-algorithm'
import { GenomeConverterService } from '../../../src/services/genome-converter-service'
import { DenominatedNote, NotationService } from '../../../src/services/notation'
import { AbcNotationRenderer } from '../../../src/services/notation/abc-notation-renderer'
import { MeasureSplitter } from '../../../src/services/notation/measure-splitter'
import { PlayableChord } from '../../../src/services/playable-chord'

describe('NotationService', () => {
    let defaultOptions: SerializedGeneticAlgorithmOptions
    let genomeConverter: jasmine.SpyObj<GenomeConverterService>
    let splitter: jasmine.SpyObj<MeasureSplitter>
    let abcRenderer: jasmine.SpyObj<AbcNotationRenderer>
    let service: NotationService

    beforeEach(() => {
        genomeConverter = jasmine.createSpyObj<GenomeConverterService>(
            'GenomeConverterService',
            [ 'convertChordsToPlayableSequence' ]
        )
        splitter = jasmine.createSpyObj<MeasureSplitter>(
            'MeasureSplitter',
            [ 'splitMeasures' ]
        )
        abcRenderer = jasmine.createSpyObj<AbcNotationRenderer>(
            'AbcNotationRenderer',
            [ 'render' ]
        )
        defaultOptions = {
            crossoverMethod: CrossoverMethod.HybridPoint,
            mutationConfig: {
                method: MutationMethod.Point,
                mutationRate: 0.01
            },
            selectionConfig: {
                method: SelectionMethod.Tournament,
                tournamentSize: 2
            },
            fitnessConfigs: [],
            geneFactoryOptions: {
                octaveRange: [ 3, 6 ],
                excludedPitches: []
            },
            timeSignature: [ 4, 4 ],
            measures: 4,
            shortestNoteDuration: 8
        }
        service = new NotationService(genomeConverter, splitter, abcRenderer)

        splitter.splitMeasures.and.returnValue([])
        genomeConverter.convertChordsToPlayableSequence.and.returnValue([])
    })

    describe('drawNotes', () => {
        let inputs: {
            genome: number[],
            options: SerializedGeneticAlgorithmOptions,
            element: HTMLElement
        }

        beforeEach(() => {
            inputs = {
                genome: [ 0, 1 ],
                options: defaultOptions,
                element: document.createElement('div')
            }
        })

        it('should convert genes to playable sequence and split measures', () => {
            const playableSequence: PlayableChord[] = [
                {
                    pitches: [ Pitch.C ],
                    pitchNames: [ Pitch[Pitch.C] ],
                    octaves: [ 1 ],
                    numberOfShortestDurations: 1
                }
            ]
            genomeConverter.convertChordsToPlayableSequence.and.returnValue(playableSequence)

            service.drawNotes(inputs)

            expect(genomeConverter.convertChordsToPlayableSequence)
                .toHaveBeenCalledWith(inputs.genome.map(g => [ g ]))
            expect(splitter.splitMeasures)
                .toHaveBeenCalledWith({
                    sequence: playableSequence,
                    timeSignature: inputs.options.timeSignature,
                    shortestNoteDuration: inputs.options.shortestNoteDuration
                })
        })

        it('should call renderer with element and correct options', () => {
            service.drawNotes(inputs)

            const args = abcRenderer.render.calls.mostRecent().args

            expect(args[0]).toEqual(inputs.element)
            expect(args[2]).toEqual({
                add_classes: true,
                responsive: 'resize',
                clickListener: undefined
            })
        })

        it('should create header string with time signature, default note length, and key', () => {
            service.drawNotes(inputs)

            const abcString = abcRenderer.render.calls.mostRecent().args[1]

            const splitOnNewLine = abcString.split('\n')
            expect(splitOnNewLine)
                .toContain(`M:${inputs.options.timeSignature[0]}/${inputs.options.timeSignature[1]}`)
            expect(splitOnNewLine).toContain('L:1/16')
            expect(splitOnNewLine).toContain('K:C clef=bass')
        })

        const clefCases: {
            genome: number[],
            expectedClef: 'treble' | 'bass',
            caseDescription: string
        }[] = [
            {
                genome: [],
                expectedClef: 'bass',
                caseDescription: 'notes are empty'
            },
            {
                genome: [
                    GeneUtil.convertToGene(Pitch.C, 2),
                    GeneUtil.convertToGene(Pitch.C, 3)
                ],
                expectedClef: 'bass',
                caseDescription: 'number of notes is even and median octave is < 3.5'
            },
            {
                genome: [
                    GeneUtil.convertToGene(Pitch.C, 3),
                    GeneUtil.convertToGene(Pitch.C, 2),
                    GeneUtil.convertToGene(Pitch.C, 3)
                ],
                expectedClef: 'bass',
                caseDescription: 'number of notes is odd and median octave is < 3.5'
            },
            {
                genome: [
                    GeneUtil.convertToGene(Pitch.C, 3),
                    GeneUtil.convertToGene(Pitch.C, 4)
                ],
                expectedClef: 'treble',
                caseDescription: 'number of notes is even and median octave is >= 3.5'
            },
            {
                genome: [
                    GeneUtil.convertToGene(Pitch.C, 5),
                    GeneUtil.convertToGene(Pitch.C, 3),
                    GeneUtil.convertToGene(Pitch.C, 4)
                ],
                expectedClef: 'treble',
                caseDescription: 'number of notes is odd and median octave is >= 3.5'
            }
        ]

        clefCases.forEach(({ genome, expectedClef, caseDescription }) => {
            it(`should include "clef=${expectedClef}" in header if ${caseDescription}`, () => {
                inputs.genome = genome

                service.drawNotes(inputs)

                const splitAbc = abcRenderer.render.calls.mostRecent().args[1].split('\n')
                expect(splitAbc).toContain(`K:C clef=${expectedClef}`)
            })
        })

        const abcCases: {
            notes: DenominatedNote[][],
            expected: string,
            caseDescription: string
        }[] = [
            {
                notes: [],
                expected: '',
                caseDescription: 'if no notes'
            },
            {
                notes: [
                    [
                        {
                            pitches: [ Pitch.C ],
                            octaves: [ 4 ],
                            durationInSixteenths: 1,
                            originalNoteIndex: 0
                        }
                    ]
                ],
                expected: 'C1',
                caseDescription: 'if C is at reference octave (viz., 4)'
            },
            {
                notes: [
                    [
                        {
                            pitches: [ Pitch.C ],
                            octaves: [ 0 ],
                            durationInSixteenths: 1,
                            originalNoteIndex: 0
                        },
                        {
                            pitches: [ Pitch.C ],
                            octaves: [ 1 ],
                            durationInSixteenths: 1,
                            originalNoteIndex: 1
                        },
                        {
                            pitches: [ Pitch.C ],
                            octaves: [ 3 ],
                            durationInSixteenths: 1,
                            originalNoteIndex: 2
                        }
                    ]
                ],
                expected: 'C,,,,1C,,,1C,1',
                caseDescription: 'so that number of "," is equal to octaves below the reference octave'
            },
            {
                notes: [
                    [
                        {
                            pitches: [ Pitch.C ],
                            octaves: [ 5 ],
                            durationInSixteenths: 1,
                            originalNoteIndex: 0
                        },
                        {
                            pitches: [ Pitch.C ],
                            octaves: [ 6 ],
                            durationInSixteenths: 1,
                            originalNoteIndex: 1
                        },
                        {
                            pitches: [ Pitch.C ],
                            octaves: [ 8 ],
                            durationInSixteenths: 1,
                            originalNoteIndex: 2
                        }
                    ]
                ],
                expected: `C'1C''1C''''1`,
                caseDescription: `so that number of "'" is equal to octaves above the reference octave`
            },
            {
                notes: [
                    [
                        {
                            pitches: [ Pitch.C ],
                            octaves: [ 4 ],
                            durationInSixteenths: 1,
                            originalNoteIndex: 0
                        },
                        {
                            pitches: [ Pitch.C ],
                            octaves: [ 4 ],
                            durationInSixteenths: 3,
                            originalNoteIndex: 1
                        },
                        {
                            pitches: [ Pitch.C ],
                            octaves: [ 4 ],
                            durationInSixteenths: 16,
                            originalNoteIndex: 2
                        }
                    ]
                ],
                expected: 'C1C3C16',
                caseDescription: 'so that duration is number of sixteenths'
            },
            {
                notes: [
                    [
                        {
                            pitches: [ Pitch.C ],
                            octaves: [ 4 ],
                            durationInSixteenths: 1,
                            originalNoteIndex: 0
                        }
                    ],
                    [
                        {
                            pitches: [ Pitch.C ],
                            octaves: [ 4 ],
                            durationInSixteenths: 3,
                            originalNoteIndex: 1
                        }
                    ],
                    [
                        {
                            pitches: [ Pitch.C ],
                            octaves: [ 4 ],
                            durationInSixteenths: 16,
                            originalNoteIndex: 2
                        }
                    ]
                ],
                expected: 'C1|C3|C16',
                caseDescription: 'so that measures are separated by "|"'
            },
            {
                notes: [
                    [
                        {
                            pitches: [ Pitch.Ab ],
                            octaves: [ 4 ],
                            durationInSixteenths: 1,
                            originalNoteIndex: 0
                        },
                        {
                            pitches: [ Pitch.C ],
                            octaves: [ 4 ],
                            durationInSixteenths: 1,
                            originalNoteIndex: 1
                        },
                        {
                            pitches: [ Pitch.Eb ],
                            octaves: [ 4 ],
                            durationInSixteenths: 1,
                            originalNoteIndex: 2
                        }
                    ]
                ],
                expected: '_A1C1_E1',
                caseDescription: 'so that flats are indicated by prefixing "_"'
            },
            {
                notes: [
                    [
                        {
                            pitches: [ Pitch.Rest ],
                            octaves: [ 4 ],
                            durationInSixteenths: 1,
                            originalNoteIndex: 0
                        },
                        {
                            pitches: [ Pitch.Rest ],
                            octaves: [ 2 ],
                            durationInSixteenths: 3,
                            originalNoteIndex: 1
                        },
                        {
                            pitches: [ Pitch.Rest ],
                            octaves: [ 4 ],
                            durationInSixteenths: 4,
                            originalNoteIndex: 2
                        }
                    ]
                ],
                expected: 'z1z3z4',
                caseDescription: 'so that rests are indicated by "z"'
            },
            {
                notes: [
                    [
                        {
                            pitches: [ Pitch.C ],
                            octaves: [ 4 ],
                            durationInSixteenths: 16,
                            originalNoteIndex: 0
                        }
                    ],
                    [
                        {
                            pitches: [ Pitch.C ],
                            octaves: [ 4 ],
                            durationInSixteenths: 4,
                            originalNoteIndex: 0
                        },
                        {
                            pitches: [ Pitch.Rest ],
                            octaves: [ 4 ],
                            durationInSixteenths: 12,
                            originalNoteIndex: 2
                        }
                    ]
                ],
                expected: 'C16-|C4z12',
                caseDescription: 'so that ties across measures are indicated by appending "-" to the first measure'
            },
            {
                notes: [
                    [
                        {
                            pitches: [ Pitch.C, Pitch.E, Pitch.A ],
                            octaves: [ 4, 4, 4 ],
                            durationInSixteenths: 1,
                            originalNoteIndex: 0
                        }
                    ]
                ],
                expected: '[C1E1A1]',
                caseDescription: 'should bracket chords'
            }
        ]

        abcCases.forEach(({ notes, expected, caseDescription }) => {
            it(`should render abc notation "${expected}" ${caseDescription}`, () => {
                splitter.splitMeasures.and.returnValue(notes)

                service.drawNotes(inputs)

                const actual = abcRenderer.render.calls.mostRecent().args[1]
                    .split('\n')
                    .pop()
                expect(actual).toEqual(expected)
            })
        })

        describe('click listener', () => {
            let listener: jasmine.Spy<(note: DenominatedNote) => void>
            let abcListener: AbcClickListener
            const notes: DenominatedNote[][] = [
                [
                    {
                        pitches: [ Pitch.C ],
                        octaves: [ 4 ],
                        durationInSixteenths: 1,
                        originalNoteIndex: 0
                    }
                ],
                [
                    {
                        pitches: [ Pitch.C ],
                        octaves: [ 4 ],
                        durationInSixteenths: 3,
                        originalNoteIndex: 1
                    }
                ],
                [
                    {
                        pitches: [ Pitch.C ],
                        octaves: [ 4 ],
                        durationInSixteenths: 16,
                        originalNoteIndex: 2
                    }
                ]
            ]

            beforeEach(() => {
                listener = jasmine.createSpy('click listener')
                splitter.splitMeasures.and.returnValue(notes)
                service.drawNotes({ ...inputs, clickListener: listener })
                const passedListener = abcRenderer.render.calls.mostRecent().args[2].clickListener

                if (!passedListener) { throw new Error('no listener passed to abc renderer') }

                abcListener = passedListener
            })

            it('should not call listener if abc element is not a note', () => {
                abcListener({ el_type: 'beam' }, 0, 'abcjs-m0 abcjs-n0', {}, null)

                expect(listener).not.toHaveBeenCalled()
            })

            it('should not call listener if classes do not contain measure or note', () => {
                abcListener({ el_type: 'note' }, 0, 'abcjs-x abcjs-y', {}, null)

                expect(listener).not.toHaveBeenCalled()
            })

            it('should not call listener if classes do not contain note', () => {
                abcListener({ el_type: 'note' }, 0, 'abcjs-m0 abcjs-y', {}, null)

                expect(listener).not.toHaveBeenCalled()
            })

            it('should not call listener if classes do not contain measure', () => {
                abcListener({ el_type: 'note' }, 0, 'abcjs-n0 abcjs-y', {}, null)

                expect(listener).not.toHaveBeenCalled()
            })

            it('should call listener with note at correct index when indices are in same class list element', () => {
                notes.forEach((measure, measureIndex) => {
                    measure.forEach((note, noteIndex) => {
                        abcListener(
                            { el_type: 'note' },
                            0,
                            `abcjs-abc abcjs-n${noteIndex} abcjs-m${measureIndex} abcjs-xyz`,
                            {},
                            null)

                        expect(listener).toHaveBeenCalledWith(note)
                    })
                })
            })

            it(
                'should call listener with note at correct index when indices are in different class list elements',
                () => {
                notes.forEach((measure, measureIndex) => {
                    measure.forEach((note, noteIndex) => {
                        abcListener(
                            { el_type: 'note' },
                            0,
                            `abcjs-abc abcjs-n${noteIndex} abcjs-m${measureIndex} abcjs-xyz`,
                            {},
                            null)

                        expect(listener).toHaveBeenCalledWith(note)
                    })
                })
            })

            it('should call listener with note at first index when multiple are specified', () => {
                notes.forEach((measure, measureIndex) => {
                    measure.forEach((note, noteIndex) => {
                        abcListener(
                            { el_type: 'note' },
                            0,
                            `abcjs-n${noteIndex} abcjs-m${measureIndex} ` +
                            `abcjs-n${noteIndex + 1} abcjs-m${measureIndex + 1}`,
                            {},
                            null)

                        expect(listener).toHaveBeenCalledWith(note)
                    })
                })
            })
        })
    })
})

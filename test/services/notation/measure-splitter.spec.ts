import { DurationDenomination } from '../../../src/common/duration-denomination'
import { Pitch } from '../../../src/common/pitch'
import { DenominatedNote } from '../../../src/services/notation'
import { MeasureSplitter } from '../../../src/services/notation/measure-splitter'
import { PlayableChord } from '../../../src/services/playable-chord'

interface CaseCategory {
    description: string
    testDescriptionFactory: (testCase: TestCase, i: number) => string
    cases: TestCase[]
}
interface TestCase {
    input: {
        sequence: PlayableChord[],
        timeSignature: [number, DurationDenomination ],
        shortestNoteDuration: DurationDenomination
    }
    expected: DenominatedNote[][]
}

describe('MeasureSplitter', () => {
    let splitter: MeasureSplitter

    beforeEach(() => {
        splitter = new MeasureSplitter()
    })

    it('should return empty array if given empty sequence', () => {
        const result = splitter.splitMeasures({
            sequence: [],
            timeSignature: [ 4, 4 ],
            shortestNoteDuration: 8
        })

        expect(result.length).toBe(0)
    })

    const easyCases: TestCase[] = [
        {
            input: {
                sequence: [
                    {
                        pitches: [ Pitch.A ],
                        pitchNames: [ Pitch[Pitch.A] ],
                        octaves: [ 1 ],
                        numberOfShortestDurations: 1
                    },
                    {
                        pitches: [ Pitch.A ],
                        pitchNames: [ Pitch[Pitch.A] ],
                        octaves: [ 1 ],
                        numberOfShortestDurations: 1
                    },
                    {
                        pitches: [ Pitch.A ],
                        pitchNames: [ Pitch[Pitch.A] ],
                        octaves: [ 1 ],
                        numberOfShortestDurations: 1
                    },
                    {
                        pitches: [ Pitch.A ],
                        pitchNames: [ Pitch[Pitch.A] ],
                        octaves: [ 1 ],
                        numberOfShortestDurations: 1
                    }
                ],
                timeSignature: [ 4, 4 ],
                shortestNoteDuration: 4
            },
            expected: [
                [
                    { pitches: [ Pitch.A ], octaves: [ 1 ], durationInSixteenths: 4, originalNoteIndex: 0 },
                    { pitches: [ Pitch.A ], octaves: [ 1 ], durationInSixteenths: 4, originalNoteIndex: 1 },
                    { pitches: [ Pitch.A ], octaves: [ 1 ], durationInSixteenths: 4, originalNoteIndex: 2 },
                    { pitches: [ Pitch.A ], octaves: [ 1 ], durationInSixteenths: 4, originalNoteIndex: 3 }
                ]
            ]
        },
        {
            input: {
                sequence: [
                    {
                        pitches: [ Pitch.A ],
                        pitchNames: [ Pitch[Pitch.A] ],
                        octaves: [ 1 ],
                        numberOfShortestDurations: 4
                    },
                    {
                        pitches: [ Pitch.A ],
                        pitchNames: [ Pitch[Pitch.A] ],
                        octaves: [ 1 ],
                        numberOfShortestDurations: 4
                    },
                    {
                        pitches: [ Pitch.A ],
                        pitchNames: [ Pitch[Pitch.A] ],
                        octaves: [ 1 ],
                        numberOfShortestDurations: 4
                    },
                    {
                        pitches: [ Pitch.A ],
                        pitchNames: [ Pitch[Pitch.A] ],
                        octaves: [ 1 ],
                        numberOfShortestDurations: 4
                    }
                ],
                timeSignature: [ 4, 4 ],
                shortestNoteDuration: 8
            },
            expected: [
                [
                    { pitches: [ Pitch.A ], octaves: [ 1 ], durationInSixteenths: 8, originalNoteIndex: 0 },
                    { pitches: [ Pitch.A ], octaves: [ 1 ], durationInSixteenths: 8, originalNoteIndex: 1 }
                ],
                [
                    { pitches: [ Pitch.A ], octaves: [ 1 ], durationInSixteenths: 8, originalNoteIndex: 2 },
                    { pitches: [ Pitch.A ], octaves: [ 1 ], durationInSixteenths: 8, originalNoteIndex: 3 }
                ]
            ]
        },
        {
            input: {
                sequence: [
                    {
                        pitches: [ Pitch.A ],
                        pitchNames: [ Pitch[Pitch.A] ],
                        octaves: [ 1 ],
                        numberOfShortestDurations: 4
                    },
                    {
                        pitches: [ Pitch.A ],
                        pitchNames: [ Pitch[Pitch.A] ],
                        octaves: [ 1 ],
                        numberOfShortestDurations: 4
                    },
                    {
                        pitches: [ Pitch.A ],
                        pitchNames: [ Pitch[Pitch.A] ],
                        octaves: [ 1 ],
                        numberOfShortestDurations: 4
                    },
                    {
                        pitches: [ Pitch.A ],
                        pitchNames: [ Pitch[Pitch.A] ],
                        octaves: [ 1 ],
                        numberOfShortestDurations: 4
                    }
                ],
                timeSignature: [ 4, 4 ],
                shortestNoteDuration: 16
            },
            expected: [
                [
                    { pitches: [ Pitch.A ], octaves: [ 1 ], durationInSixteenths: 4, originalNoteIndex: 0 },
                    { pitches: [ Pitch.A ], octaves: [ 1 ], durationInSixteenths: 4, originalNoteIndex: 1 },
                    { pitches: [ Pitch.A ], octaves: [ 1 ], durationInSixteenths: 4, originalNoteIndex: 2 },
                    { pitches: [ Pitch.A ], octaves: [ 1 ], durationInSixteenths: 4, originalNoteIndex: 3 }
                ]
            ]
        },
        {
            input: {
                sequence: [
                    {
                        pitches: [ Pitch.A ],
                        pitchNames: [ Pitch[Pitch.A] ],
                        octaves: [ 1 ],
                        numberOfShortestDurations: 1
                    },
                    {
                        pitches: [ Pitch.A ],
                        pitchNames: [ Pitch[Pitch.A] ],
                        octaves: [ 1 ],
                        numberOfShortestDurations: 2
                    },
                    {
                        pitches: [ Pitch.A ],
                        pitchNames: [ Pitch[Pitch.A] ],
                        octaves: [ 1 ],
                        numberOfShortestDurations: 2
                    },
                    {
                        pitches: [ Pitch.A ],
                        pitchNames: [ Pitch[Pitch.A] ],
                        octaves: [ 1 ],
                        numberOfShortestDurations: 1
                    }
                ],
                timeSignature: [ 6, 8 ],
                shortestNoteDuration: 8
            },
            expected: [
                [
                    { pitches: [ Pitch.A ], octaves: [ 1 ], durationInSixteenths: 2, originalNoteIndex: 0 },
                    { pitches: [ Pitch.A ], octaves: [ 1 ], durationInSixteenths: 4, originalNoteIndex: 1 },
                    { pitches: [ Pitch.A ], octaves: [ 1 ], durationInSixteenths: 4, originalNoteIndex: 2 },
                    { pitches: [ Pitch.A ], octaves: [ 1 ], durationInSixteenths: 2, originalNoteIndex: 3 }
                ]
            ]
        },
        {
            input: {
                sequence: [
                    {
                        pitches: [ Pitch.A ],
                        pitchNames: [ Pitch[Pitch.A] ],
                        octaves: [ 1 ],
                        numberOfShortestDurations: 1
                    },
                    {
                        pitches: [ Pitch.A ],
                        pitchNames: [ Pitch[Pitch.A] ],
                        octaves: [ 1 ],
                        numberOfShortestDurations: 2
                    },
                    {
                        pitches: [ Pitch.A ],
                        pitchNames: [ Pitch[Pitch.A] ],
                        octaves: [ 1 ],
                        numberOfShortestDurations: 2
                    },
                    {
                        pitches: [ Pitch.A ],
                        pitchNames: [ Pitch[Pitch.A] ],
                        octaves: [ 1 ],
                        numberOfShortestDurations: 1
                    },
                    {
                        pitches: [ Pitch.A ],
                        pitchNames: [ Pitch[Pitch.A] ],
                        octaves: [ 1 ],
                        numberOfShortestDurations: 1
                    },
                    {
                        pitches: [ Pitch.A ],
                        pitchNames: [ Pitch[Pitch.A] ],
                        octaves: [ 1 ],
                        numberOfShortestDurations: 2
                    },
                    {
                        pitches: [ Pitch.A ],
                        pitchNames: [ Pitch[Pitch.A] ],
                        octaves: [ 1 ],
                        numberOfShortestDurations: 2
                    },
                    {
                        pitches: [ Pitch.A ],
                        pitchNames: [ Pitch[Pitch.A] ],
                        octaves: [ 1 ],
                        numberOfShortestDurations: 1
                    }
                ],
                timeSignature: [ 6, 8 ],
                shortestNoteDuration: 8
            },
            expected: [
                [
                    { pitches: [ Pitch.A ], octaves: [ 1 ], durationInSixteenths: 2, originalNoteIndex: 0 },
                    { pitches: [ Pitch.A ], octaves: [ 1 ], durationInSixteenths: 4, originalNoteIndex: 1 },
                    { pitches: [ Pitch.A ], octaves: [ 1 ], durationInSixteenths: 4, originalNoteIndex: 2 },
                    { pitches: [ Pitch.A ], octaves: [ 1 ], durationInSixteenths: 2, originalNoteIndex: 3 }
                ],
                [
                    { pitches: [ Pitch.A ], octaves: [ 1 ], durationInSixteenths: 2, originalNoteIndex: 4 },
                    { pitches: [ Pitch.A ], octaves: [ 1 ], durationInSixteenths: 4, originalNoteIndex: 5 },
                    { pitches: [ Pitch.A ], octaves: [ 1 ], durationInSixteenths: 4, originalNoteIndex: 6 },
                    { pitches: [ Pitch.A ], octaves: [ 1 ], durationInSixteenths: 2, originalNoteIndex: 7 }
                ]
            ]
        },
        {
            input: {
                sequence: [
                    {
                        pitches: [ Pitch.A ],
                        pitchNames: [ Pitch[Pitch.A] ],
                        octaves: [ 1 ],
                        numberOfShortestDurations: 1
                    },
                    {
                        pitches: [ Pitch.A ],
                        pitchNames: [ Pitch[Pitch.A] ],
                        octaves: [ 1 ],
                        numberOfShortestDurations: 1
                    }
                ],
                timeSignature: [ 4, 4 ],
                shortestNoteDuration: 1
            },
            expected: [
                [
                    { pitches: [ Pitch.A ], octaves: [ 1 ], durationInSixteenths: 16, originalNoteIndex: 0 }
                ],
                [
                    { pitches: [ Pitch.A ], octaves: [ 1 ], durationInSixteenths: 16, originalNoteIndex: 1 }
                ]
            ]
        }
    ]

    const dottedNoteCases: TestCase[] = [
        {
            input: {
                sequence: [
                    {
                        pitches: [ Pitch.A ],
                        pitchNames: [ Pitch[Pitch.A] ],
                        octaves: [ 1 ],
                        numberOfShortestDurations: 3
                    },
                    {
                        pitches: [ Pitch.A ],
                        pitchNames: [ Pitch[Pitch.A] ],
                        octaves: [ 1 ],
                        numberOfShortestDurations: 1
                    }
                ],
                timeSignature: [ 4, 4 ],
                shortestNoteDuration: 4
            },
            expected: [
                [
                    { pitches: [ Pitch.A ], octaves: [ 1 ], durationInSixteenths: 12, originalNoteIndex: 0 },
                    { pitches: [ Pitch.A ], octaves: [ 1 ], durationInSixteenths: 4, originalNoteIndex: 1 }
                ]
            ]
        },
        {
            input: {
                sequence: [
                    {
                        pitches: [ Pitch.A ],
                        pitchNames: [ Pitch[Pitch.A] ],
                        octaves: [ 1 ],
                        numberOfShortestDurations: 3
                    },
                    {
                        pitches: [ Pitch.A ],
                        pitchNames: [ Pitch[Pitch.A] ],
                        octaves: [ 1 ],
                        numberOfShortestDurations: 3
                    }
                ],
                timeSignature: [ 3, 4 ],
                shortestNoteDuration: 8
            },
            expected: [
                [
                    { pitches: [ Pitch.A ], octaves: [ 1 ], durationInSixteenths: 6, originalNoteIndex: 0 },
                    { pitches: [ Pitch.A ], octaves: [ 1 ], durationInSixteenths: 6, originalNoteIndex: 1 }
                ]
            ]
        },
        {
            input: {
                sequence: [
                    {
                        pitches: [ Pitch.A ],
                        pitchNames: [ Pitch[Pitch.A] ],
                        octaves: [ 1 ],
                        numberOfShortestDurations: 2
                    },
                    {
                        pitches: [ Pitch.A ],
                        pitchNames: [ Pitch[Pitch.A] ],
                        octaves: [ 1 ],
                        numberOfShortestDurations: 3
                    },
                    {
                        pitches: [ Pitch.A ],
                        pitchNames: [ Pitch[Pitch.A] ],
                        octaves: [ 1 ],
                        numberOfShortestDurations: 2
                    }
                ],
                timeSignature: [ 7, 8 ],
                shortestNoteDuration: 8
            },
            expected: [
                [
                    { pitches: [ Pitch.A ], octaves: [ 1 ], durationInSixteenths: 4, originalNoteIndex: 0 },
                    { pitches: [ Pitch.A ], octaves: [ 1 ], durationInSixteenths: 6, originalNoteIndex: 1 },
                    { pitches: [ Pitch.A ], octaves: [ 1 ], durationInSixteenths: 4, originalNoteIndex: 2 }
                ]
            ]
        },
        {
            input: {
                sequence: [
                    {
                        pitches: [ Pitch.A ],
                        pitchNames: [ Pitch[Pitch.A] ],
                        octaves: [ 1 ],
                        numberOfShortestDurations: 4
                    },
                    {
                        pitches: [ Pitch.A ],
                        pitchNames: [ Pitch[Pitch.A] ],
                        octaves: [ 1 ],
                        numberOfShortestDurations: 6
                    },
                    {
                        pitches: [ Pitch.A ],
                        pitchNames: [ Pitch[Pitch.A] ],
                        octaves: [ 1 ],
                        numberOfShortestDurations: 4
                    },
                    {
                        pitches: [ Pitch.A ],
                        pitchNames: [ Pitch[Pitch.A] ],
                        octaves: [ 1 ],
                        numberOfShortestDurations: 12
                    },
                    {
                        pitches: [ Pitch.A ],
                        pitchNames: [ Pitch[Pitch.A] ],
                        octaves: [ 1 ],
                        numberOfShortestDurations: 1
                    },
                    {
                        pitches: [ Pitch.A ],
                        pitchNames: [ Pitch[Pitch.A] ],
                        octaves: [ 1 ],
                        numberOfShortestDurations: 1
                    }
                ],
                timeSignature: [ 7, 8 ],
                shortestNoteDuration: 16
            },
            expected: [
                [
                    { pitches: [ Pitch.A ], octaves: [ 1 ], durationInSixteenths: 4, originalNoteIndex: 0 },
                    { pitches: [ Pitch.A ], octaves: [ 1 ], durationInSixteenths: 6, originalNoteIndex: 1 },
                    { pitches: [ Pitch.A ], octaves: [ 1 ], durationInSixteenths: 4, originalNoteIndex: 2 }
                ],
                [
                    { pitches: [ Pitch.A ], octaves: [ 1 ], durationInSixteenths: 12, originalNoteIndex: 3 },
                    { pitches: [ Pitch.A ], octaves: [ 1 ], durationInSixteenths: 1, originalNoteIndex: 4 },
                    { pitches: [ Pitch.A ], octaves: [ 1 ], durationInSixteenths: 1, originalNoteIndex: 5 }
                ]
            ]
        },
        {
            input: {
                sequence: [
                    {
                        pitches: [ Pitch.A ],
                        pitchNames: [ Pitch[Pitch.A] ],
                        octaves: [ 1 ],
                        numberOfShortestDurations: 3
                    },
                    {
                        pitches: [ Pitch.A ],
                        pitchNames: [ Pitch[Pitch.A] ],
                        octaves: [ 1 ],
                        numberOfShortestDurations: 3
                    },
                    {
                        pitches: [ Pitch.A ],
                        pitchNames: [ Pitch[Pitch.A] ],
                        octaves: [ 1 ],
                        numberOfShortestDurations: 6
                    }
                ],
                timeSignature: [ 6, 2 ],
                shortestNoteDuration: 4
            },
            expected: [
                [
                    { pitches: [ Pitch.A ], octaves: [ 1 ], durationInSixteenths: 12, originalNoteIndex: 0 },
                    { pitches: [ Pitch.A ], octaves: [ 1 ], durationInSixteenths: 12, originalNoteIndex: 1 },
                    { pitches: [ Pitch.A ], octaves: [ 1 ], durationInSixteenths: 24, originalNoteIndex: 2 }
                ]
            ]
        }
    ]

    const tieOverMeasureCases: TestCase[] = [
        {
            input: {
                sequence: [
                    {
                        pitches: [ Pitch.A ],
                        pitchNames: [ Pitch[Pitch.A] ],
                        octaves: [ 1 ],
                        numberOfShortestDurations: 8
                    }
                ],
                timeSignature: [ 4, 4 ],
                shortestNoteDuration: 4
            },
            expected: [
                [
                    { pitches: [ Pitch.A ], octaves: [ 1 ], durationInSixteenths: 16, originalNoteIndex: 0 }
                ],
                [
                    { pitches: [ Pitch.A ], octaves: [ 1 ], durationInSixteenths: 16, originalNoteIndex: 0 }
                ]
            ]
        },
        {
            input: {
                sequence: [
                    {
                        pitches: [ Pitch.A ],
                        pitchNames: [ Pitch[Pitch.A] ],
                        octaves: [ 1 ],
                        numberOfShortestDurations: 12
                    }
                ],
                timeSignature: [ 4, 4 ],
                shortestNoteDuration: 4
            },
            expected: [
                [
                    { pitches: [ Pitch.A ], octaves: [ 1 ], durationInSixteenths: 16, originalNoteIndex: 0 }
                ],
                [
                    { pitches: [ Pitch.A ], octaves: [ 1 ], durationInSixteenths: 16, originalNoteIndex: 0 }
                ],
                [
                    { pitches: [ Pitch.A ], octaves: [ 1 ], durationInSixteenths: 16, originalNoteIndex: 0 }
                ]
            ]
        },
        {
            input: {
                sequence: [
                    {
                        pitches: [ Pitch.A ],
                        pitchNames: [ Pitch[Pitch.A] ],
                        octaves: [ 1 ],
                        numberOfShortestDurations: 10
                    },
                    {
                        pitches: [ Pitch.A ],
                        pitchNames: [ Pitch[Pitch.A] ],
                        octaves: [ 1 ],
                        numberOfShortestDurations: 2
                    },
                    {
                        pitches: [ Pitch.A ],
                        pitchNames: [ Pitch[Pitch.A] ],
                        octaves: [ 1 ],
                        numberOfShortestDurations: 2
                    }
                ],
                timeSignature: [ 7, 8 ],
                shortestNoteDuration: 8
            },
            expected: [
                [
                    { pitches: [ Pitch.A ], octaves: [ 1 ], durationInSixteenths: 14, originalNoteIndex: 0 }
                ],
                [
                    { pitches: [ Pitch.A ], octaves: [ 1 ], durationInSixteenths: 6, originalNoteIndex: 0 },
                    { pitches: [ Pitch.A ], octaves: [ 1 ], durationInSixteenths: 4, originalNoteIndex: 1 },
                    { pitches: [ Pitch.A ], octaves: [ 1 ], durationInSixteenths: 4, originalNoteIndex: 2 }
                ]
            ]
        },
        {
            input: {
                sequence: [
                    {
                        pitches: [ Pitch.A ],
                        pitchNames: [ Pitch[Pitch.A] ],
                        octaves: [ 1 ],
                        numberOfShortestDurations: 1
                    },
                    {
                        pitches: [ Pitch.A ],
                        pitchNames: [ Pitch[Pitch.A] ],
                        octaves: [ 1 ],
                        numberOfShortestDurations: 12
                    },
                    {
                        pitches: [ Pitch.A ],
                        pitchNames: [ Pitch[Pitch.A] ],
                        octaves: [ 1 ],
                        numberOfShortestDurations: 11
                    }
                ],
                timeSignature: [ 3, 4 ],
                shortestNoteDuration: 16
            },
            expected: [
                [
                    { pitches: [ Pitch.A ], octaves: [ 1 ], durationInSixteenths: 1, originalNoteIndex: 0 },
                    { pitches: [ Pitch.A ], octaves: [ 1 ], durationInSixteenths: 11, originalNoteIndex: 1 }
                ],
                [
                    { pitches: [ Pitch.A ], octaves: [ 1 ], durationInSixteenths: 1, originalNoteIndex: 1 },
                    { pitches: [ Pitch.A ], octaves: [ 1 ], durationInSixteenths: 11, originalNoteIndex: 2 }
                ]
            ]
        }
    ]

    const chordCases: TestCase[] = [
        {
            input: {
                sequence: [
                    {
                        pitches: [ Pitch.A, Pitch.B, Pitch.C ],
                        pitchNames: [ Pitch[Pitch.A], Pitch[Pitch.B], Pitch[Pitch.C] ],
                        octaves: [ 1, 1, 2 ],
                        numberOfShortestDurations: 1
                    },
                    {
                        pitches: [ Pitch.A ],
                        pitchNames: [ Pitch[Pitch.A] ],
                        octaves: [ 1 ],
                        numberOfShortestDurations: 1
                    },
                    {
                        pitches: [ Pitch.A, Pitch.B, Pitch.C ],
                        pitchNames: [ Pitch[Pitch.A], Pitch[Pitch.B], Pitch[Pitch.C] ],
                        octaves: [ 1, 2, 1 ],
                        numberOfShortestDurations: 1
                    },
                    {
                        pitches: [ Pitch.A ],
                        pitchNames: [ Pitch[Pitch.A] ],
                        octaves: [ 1 ],
                        numberOfShortestDurations: 1
                    }
                ],
                timeSignature: [ 4, 4 ],
                shortestNoteDuration: 4
            },
            expected: [
                [
                    {
                        pitches: [ Pitch.A, Pitch.B, Pitch.C ],
                        octaves: [ 1, 1, 2 ],
                        durationInSixteenths: 4,
                        originalNoteIndex: 0
                    },
                    { pitches: [ Pitch.A ], octaves: [ 1 ], durationInSixteenths: 4, originalNoteIndex: 1 },
                    {
                        pitches: [ Pitch.A, Pitch.B, Pitch.C ],
                        octaves: [ 1, 2, 1 ],
                        durationInSixteenths: 4,
                        originalNoteIndex: 2
                    },
                    { pitches: [ Pitch.A ], octaves: [ 1 ], durationInSixteenths: 4, originalNoteIndex: 3 }
                ]
            ]
        }
    ]

    const caseCategories: CaseCategory[] = [
        {
            description: 'sequences that are evenly distributed',
            testDescriptionFactory: ({ expected }, i) =>
                `should correctly split case ${i} into ${expected.length} measures`,
            cases: easyCases
        },
        {
            description: 'sequences with dotted notes',
            testDescriptionFactory: ({ expected }, i) =>
                `should correctly split case ${i} into ${expected.length} measures`,
            cases: dottedNoteCases
        },
        {
            description: 'sequences with ties spanning measure bars',
            testDescriptionFactory: ({ expected }, i) =>
                `should correctly split case ${i} into ${expected.length} measures`,
            cases: tieOverMeasureCases
        },
        {
            description: 'sequences with chords',
            testDescriptionFactory: ({ expected }, i) =>
                `should correctly split case ${i} into ${expected.length} measures`,
            cases: chordCases
        }
    ]

    caseCategories.forEach(({ description, testDescriptionFactory, cases }) => {
        describe(description, () => {
            cases.forEach((testCase, caseIdx) => {
                it(testDescriptionFactory(testCase, caseIdx), () => {
                    const measures = splitter.splitMeasures(testCase.input)

                    expect(measures.length).toBe(testCase.expected.length, 'number of measures is wrong')
                    measures.forEach((measure, measureIdx) => {
                        const expectedMeasure = testCase.expected[measureIdx]

                        expect(measure.length)
                            .toBe(expectedMeasure.length, `number of notes in measure ${measureIdx} is wrong`)

                        measure.forEach((note, noteIdx) => {
                            expect(note)
                                .toEqual(expectedMeasure[noteIdx], `measure ${measureIdx}, note ${noteIdx} is wrong`)
                        })
                    })
                })
            })
        })
    })
})

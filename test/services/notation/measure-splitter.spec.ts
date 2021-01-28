import { DurationDenomination } from '../../../src/common/duration-denomination'
import { Pitch } from '../../../src/common/pitch'
import { DenominatedNote } from '../../../src/services/notation'
import { MeasureSplitter } from '../../../src/services/notation/measure-splitter'
import { PlayableNote } from '../../../src/services/playable-note'

interface CaseCategory {
    description: string
    testDescriptionFactory: (testCase: TestCase, i: number) => string
    cases: TestCase[]
}
interface TestCase {
    input: {
        sequence: PlayableNote[],
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
                    { pitch: Pitch.A, pitchName: Pitch[Pitch.A], octave: 1, numberOfShortestDurations: 1 },
                    { pitch: Pitch.A, pitchName: Pitch[Pitch.A], octave: 1, numberOfShortestDurations: 1 },
                    { pitch: Pitch.A, pitchName: Pitch[Pitch.A], octave: 1, numberOfShortestDurations: 1 },
                    { pitch: Pitch.A, pitchName: Pitch[Pitch.A], octave: 1, numberOfShortestDurations: 1 }
                ],
                timeSignature: [ 4, 4 ],
                shortestNoteDuration: 4
            },
            expected: [
                [
                    { pitch: Pitch.A, octave: 1, durationInSixteenths: 4, originalNoteIndex: 0 },
                    { pitch: Pitch.A, octave: 1, durationInSixteenths: 4, originalNoteIndex: 1 },
                    { pitch: Pitch.A, octave: 1, durationInSixteenths: 4, originalNoteIndex: 2 },
                    { pitch: Pitch.A, octave: 1, durationInSixteenths: 4, originalNoteIndex: 3 }
                ]
            ]
        },
        {
            input: {
                sequence: [
                    { pitch: Pitch.A, pitchName: Pitch[Pitch.A], octave: 1, numberOfShortestDurations: 4 },
                    { pitch: Pitch.A, pitchName: Pitch[Pitch.A], octave: 1, numberOfShortestDurations: 4 },
                    { pitch: Pitch.A, pitchName: Pitch[Pitch.A], octave: 1, numberOfShortestDurations: 4 },
                    { pitch: Pitch.A, pitchName: Pitch[Pitch.A], octave: 1, numberOfShortestDurations: 4 }
                ],
                timeSignature: [ 4, 4 ],
                shortestNoteDuration: 8
            },
            expected: [
                [
                    { pitch: Pitch.A, octave: 1, durationInSixteenths: 8, originalNoteIndex: 0 },
                    { pitch: Pitch.A, octave: 1, durationInSixteenths: 8, originalNoteIndex: 1 }
                ],
                [
                    { pitch: Pitch.A, octave: 1, durationInSixteenths: 8, originalNoteIndex: 2 },
                    { pitch: Pitch.A, octave: 1, durationInSixteenths: 8, originalNoteIndex: 3 }
                ]
            ]
        },
        {
            input: {
                sequence: [
                    { pitch: Pitch.A, pitchName: Pitch[Pitch.A], octave: 1, numberOfShortestDurations: 4 },
                    { pitch: Pitch.A, pitchName: Pitch[Pitch.A], octave: 1, numberOfShortestDurations: 4 },
                    { pitch: Pitch.A, pitchName: Pitch[Pitch.A], octave: 1, numberOfShortestDurations: 4 },
                    { pitch: Pitch.A, pitchName: Pitch[Pitch.A], octave: 1, numberOfShortestDurations: 4 }
                ],
                timeSignature: [ 4, 4 ],
                shortestNoteDuration: 16
            },
            expected: [
                [
                    { pitch: Pitch.A, octave: 1, durationInSixteenths: 4, originalNoteIndex: 0 },
                    { pitch: Pitch.A, octave: 1, durationInSixteenths: 4, originalNoteIndex: 1 },
                    { pitch: Pitch.A, octave: 1, durationInSixteenths: 4, originalNoteIndex: 2 },
                    { pitch: Pitch.A, octave: 1, durationInSixteenths: 4, originalNoteIndex: 3 }
                ]
            ]
        },
        {
            input: {
                sequence: [
                    { pitch: Pitch.A, pitchName: Pitch[Pitch.A], octave: 1, numberOfShortestDurations: 1 },
                    { pitch: Pitch.A, pitchName: Pitch[Pitch.A], octave: 1, numberOfShortestDurations: 2 },
                    { pitch: Pitch.A, pitchName: Pitch[Pitch.A], octave: 1, numberOfShortestDurations: 2 },
                    { pitch: Pitch.A, pitchName: Pitch[Pitch.A], octave: 1, numberOfShortestDurations: 1 }
                ],
                timeSignature: [ 6, 8 ],
                shortestNoteDuration: 8
            },
            expected: [
                [
                    { pitch: Pitch.A, octave: 1, durationInSixteenths: 2, originalNoteIndex: 0 },
                    { pitch: Pitch.A, octave: 1, durationInSixteenths: 4, originalNoteIndex: 1 },
                    { pitch: Pitch.A, octave: 1, durationInSixteenths: 4, originalNoteIndex: 2 },
                    { pitch: Pitch.A, octave: 1, durationInSixteenths: 2, originalNoteIndex: 3 }
                ]
            ]
        },
        {
            input: {
                sequence: [
                    { pitch: Pitch.A, pitchName: Pitch[Pitch.A], octave: 1, numberOfShortestDurations: 1 },
                    { pitch: Pitch.A, pitchName: Pitch[Pitch.A], octave: 1, numberOfShortestDurations: 2 },
                    { pitch: Pitch.A, pitchName: Pitch[Pitch.A], octave: 1, numberOfShortestDurations: 2 },
                    { pitch: Pitch.A, pitchName: Pitch[Pitch.A], octave: 1, numberOfShortestDurations: 1 },
                    { pitch: Pitch.A, pitchName: Pitch[Pitch.A], octave: 1, numberOfShortestDurations: 1 },
                    { pitch: Pitch.A, pitchName: Pitch[Pitch.A], octave: 1, numberOfShortestDurations: 2 },
                    { pitch: Pitch.A, pitchName: Pitch[Pitch.A], octave: 1, numberOfShortestDurations: 2 },
                    { pitch: Pitch.A, pitchName: Pitch[Pitch.A], octave: 1, numberOfShortestDurations: 1 }
                ],
                timeSignature: [ 6, 8 ],
                shortestNoteDuration: 8
            },
            expected: [
                [
                    { pitch: Pitch.A, octave: 1, durationInSixteenths: 2, originalNoteIndex: 0 },
                    { pitch: Pitch.A, octave: 1, durationInSixteenths: 4, originalNoteIndex: 1 },
                    { pitch: Pitch.A, octave: 1, durationInSixteenths: 4, originalNoteIndex: 2 },
                    { pitch: Pitch.A, octave: 1, durationInSixteenths: 2, originalNoteIndex: 3 }
                ],
                [
                    { pitch: Pitch.A, octave: 1, durationInSixteenths: 2, originalNoteIndex: 4 },
                    { pitch: Pitch.A, octave: 1, durationInSixteenths: 4, originalNoteIndex: 5 },
                    { pitch: Pitch.A, octave: 1, durationInSixteenths: 4, originalNoteIndex: 6 },
                    { pitch: Pitch.A, octave: 1, durationInSixteenths: 2, originalNoteIndex: 7 }
                ]
            ]
        },
        {
            input: {
                sequence: [
                    { pitch: Pitch.A, pitchName: Pitch[Pitch.A], octave: 1, numberOfShortestDurations: 1 },
                    { pitch: Pitch.A, pitchName: Pitch[Pitch.A], octave: 1, numberOfShortestDurations: 1 }
                ],
                timeSignature: [ 4, 4 ],
                shortestNoteDuration: 1
            },
            expected: [
                [
                    { pitch: Pitch.A, octave: 1, durationInSixteenths: 16, originalNoteIndex: 0 }
                ],
                [
                    { pitch: Pitch.A, octave: 1, durationInSixteenths: 16, originalNoteIndex: 1 }
                ]
            ]
        }
    ]

    const dottedNoteCases: TestCase[] = [
        {
            input: {
                sequence: [
                    { pitch: Pitch.A, pitchName: Pitch[Pitch.A], octave: 1, numberOfShortestDurations: 3 },
                    { pitch: Pitch.A, pitchName: Pitch[Pitch.A], octave: 1, numberOfShortestDurations: 1 }
                ],
                timeSignature: [ 4, 4 ],
                shortestNoteDuration: 4
            },
            expected: [
                [
                    { pitch: Pitch.A, octave: 1, durationInSixteenths: 12, originalNoteIndex: 0 },
                    { pitch: Pitch.A, octave: 1, durationInSixteenths: 4, originalNoteIndex: 1 }
                ]
            ]
        },
        {
            input: {
                sequence: [
                    { pitch: Pitch.A, pitchName: Pitch[Pitch.A], octave: 1, numberOfShortestDurations: 3 },
                    { pitch: Pitch.A, pitchName: Pitch[Pitch.A], octave: 1, numberOfShortestDurations: 3 }
                ],
                timeSignature: [ 3, 4 ],
                shortestNoteDuration: 8
            },
            expected: [
                [
                    { pitch: Pitch.A, octave: 1, durationInSixteenths: 6, originalNoteIndex: 0 },
                    { pitch: Pitch.A, octave: 1, durationInSixteenths: 6, originalNoteIndex: 1 }
                ]
            ]
        },
        {
            input: {
                sequence: [
                    { pitch: Pitch.A, pitchName: Pitch[Pitch.A], octave: 1, numberOfShortestDurations: 2 },
                    { pitch: Pitch.A, pitchName: Pitch[Pitch.A], octave: 1, numberOfShortestDurations: 3 },
                    { pitch: Pitch.A, pitchName: Pitch[Pitch.A], octave: 1, numberOfShortestDurations: 2 }
                ],
                timeSignature: [ 7, 8 ],
                shortestNoteDuration: 8
            },
            expected: [
                [
                    { pitch: Pitch.A, octave: 1, durationInSixteenths: 4, originalNoteIndex: 0 },
                    { pitch: Pitch.A, octave: 1, durationInSixteenths: 6, originalNoteIndex: 1 },
                    { pitch: Pitch.A, octave: 1, durationInSixteenths: 4, originalNoteIndex: 2 }
                ]
            ]
        },
        {
            input: {
                sequence: [
                    { pitch: Pitch.A, pitchName: Pitch[Pitch.A], octave: 1, numberOfShortestDurations: 4 },
                    { pitch: Pitch.A, pitchName: Pitch[Pitch.A], octave: 1, numberOfShortestDurations: 6 },
                    { pitch: Pitch.A, pitchName: Pitch[Pitch.A], octave: 1, numberOfShortestDurations: 4 },
                    { pitch: Pitch.A, pitchName: Pitch[Pitch.A], octave: 1, numberOfShortestDurations: 12 },
                    { pitch: Pitch.A, pitchName: Pitch[Pitch.A], octave: 1, numberOfShortestDurations: 1 },
                    { pitch: Pitch.A, pitchName: Pitch[Pitch.A], octave: 1, numberOfShortestDurations: 1 }
                ],
                timeSignature: [ 7, 8 ],
                shortestNoteDuration: 16
            },
            expected: [
                [
                    { pitch: Pitch.A, octave: 1, durationInSixteenths: 4, originalNoteIndex: 0 },
                    { pitch: Pitch.A, octave: 1, durationInSixteenths: 6, originalNoteIndex: 1 },
                    { pitch: Pitch.A, octave: 1, durationInSixteenths: 4, originalNoteIndex: 2 }
                ],
                [
                    { pitch: Pitch.A, octave: 1, durationInSixteenths: 12, originalNoteIndex: 3 },
                    { pitch: Pitch.A, octave: 1, durationInSixteenths: 1, originalNoteIndex: 4 },
                    { pitch: Pitch.A, octave: 1, durationInSixteenths: 1, originalNoteIndex: 5 }
                ]
            ]
        },
        {
            input: {
                sequence: [
                    { pitch: Pitch.A, pitchName: Pitch[Pitch.A], octave: 1, numberOfShortestDurations: 3 },
                    { pitch: Pitch.A, pitchName: Pitch[Pitch.A], octave: 1, numberOfShortestDurations: 3 },
                    { pitch: Pitch.A, pitchName: Pitch[Pitch.A], octave: 1, numberOfShortestDurations: 6 }
                ],
                timeSignature: [ 6, 2 ],
                shortestNoteDuration: 4
            },
            expected: [
                [
                    { pitch: Pitch.A, octave: 1, durationInSixteenths: 12, originalNoteIndex: 0 },
                    { pitch: Pitch.A, octave: 1, durationInSixteenths: 12, originalNoteIndex: 1 },
                    { pitch: Pitch.A, octave: 1, durationInSixteenths: 24, originalNoteIndex: 2 }
                ]
            ]
        }
    ]

    const tieOverMeasureCases: TestCase[] = [
        {
            input: {
                sequence: [
                    { pitch: Pitch.A, pitchName: Pitch[Pitch.A], octave: 1, numberOfShortestDurations: 8 }
                ],
                timeSignature: [ 4, 4 ],
                shortestNoteDuration: 4
            },
            expected: [
                [
                    { pitch: Pitch.A, octave: 1, durationInSixteenths: 16, originalNoteIndex: 0 }
                ],
                [
                    { pitch: Pitch.A, octave: 1, durationInSixteenths: 16, originalNoteIndex: 0 }
                ]
            ]
        },
        {
            input: {
                sequence: [
                    { pitch: Pitch.A, pitchName: Pitch[Pitch.A], octave: 1, numberOfShortestDurations: 12 }
                ],
                timeSignature: [ 4, 4 ],
                shortestNoteDuration: 4
            },
            expected: [
                [
                    { pitch: Pitch.A, octave: 1, durationInSixteenths: 16, originalNoteIndex: 0 }
                ],
                [
                    { pitch: Pitch.A, octave: 1, durationInSixteenths: 16, originalNoteIndex: 0 }
                ],
                [
                    { pitch: Pitch.A, octave: 1, durationInSixteenths: 16, originalNoteIndex: 0 }
                ]
            ]
        },
        {
            input: {
                sequence: [
                    { pitch: Pitch.A, pitchName: Pitch[Pitch.A], octave: 1, numberOfShortestDurations: 10 },
                    { pitch: Pitch.A, pitchName: Pitch[Pitch.A], octave: 1, numberOfShortestDurations: 2 },
                    { pitch: Pitch.A, pitchName: Pitch[Pitch.A], octave: 1, numberOfShortestDurations: 2 }
                ],
                timeSignature: [ 7, 8 ],
                shortestNoteDuration: 8
            },
            expected: [
                [
                    { pitch: Pitch.A, octave: 1, durationInSixteenths: 14, originalNoteIndex: 0 }
                ],
                [
                    { pitch: Pitch.A, octave: 1, durationInSixteenths: 6, originalNoteIndex: 0 },
                    { pitch: Pitch.A, octave: 1, durationInSixteenths: 4, originalNoteIndex: 1 },
                    { pitch: Pitch.A, octave: 1, durationInSixteenths: 4, originalNoteIndex: 2 }
                ]
            ]
        },
        {
            input: {
                sequence: [
                    { pitch: Pitch.A, pitchName: Pitch[Pitch.A], octave: 1, numberOfShortestDurations: 1 },
                    { pitch: Pitch.A, pitchName: Pitch[Pitch.A], octave: 1, numberOfShortestDurations: 12 },
                    { pitch: Pitch.A, pitchName: Pitch[Pitch.A], octave: 1, numberOfShortestDurations: 11 }
                ],
                timeSignature: [ 3, 4 ],
                shortestNoteDuration: 16
            },
            expected: [
                [
                    { pitch: Pitch.A, octave: 1, durationInSixteenths: 1, originalNoteIndex: 0 },
                    { pitch: Pitch.A, octave: 1, durationInSixteenths: 11, originalNoteIndex: 1 }
                ],
                [
                    { pitch: Pitch.A, octave: 1, durationInSixteenths: 1, originalNoteIndex: 1 },
                    { pitch: Pitch.A, octave: 1, durationInSixteenths: 11, originalNoteIndex: 2 }
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

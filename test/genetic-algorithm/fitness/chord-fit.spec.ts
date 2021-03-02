import { GeneUtil } from '../../../src/common/gene-util'
import { Pitch } from '../../../src/common/pitch'
import { chordFitFactory } from '../../../src/genetic-algorithm/fitness/chord-fit-factory'
import { Population } from '../../../src/genetic-algorithm/population'

describe('chordFit', () => {
    it('should return array of same size as population', () => {
        const population = new Population({
            size: 5,
            genomeSize: 4,
            geneFactory: () => Pitch.C
        })
        const chords = {}

        const fitnesses = chordFitFactory({ chords })(population)

        expect(fitnesses.length).toEqual(population.size)
    })

    it('should return 0 if all rests', () => {
        const population = new Population({
            size: 3,
            genomeSize: 4,
            geneFactory: () => Pitch.Rest
        })
        const chords = { 0: [ Pitch.C, Pitch.B ] }

        const fitnesses = chordFitFactory({ chords })(population)

        for (const fitness of fitnesses) {
            expect(fitness).toBe(0)
        }
    })

    it('should return 0 if no chords', () => {
        const population = new Population({
            size: 3,
            genomeSize: 4,
            geneFactory: () => Pitch.C
        })
        const chords = {}

        const fitnesses = chordFitFactory({ chords })(population)

        for (const fitness of fitnesses) {
            expect(fitness).toBe(0)
        }
    })

    it('should return 100 if all pitches in chords', () => {
        const population = new Population({
            size: 3,
            genomeSize: 4,
            geneFactory: () => Pitch.C
        })
        const chords = { 0: [ Pitch.C ] }

        const fitnesses = chordFitFactory({ chords })(population)

        for (const fitness of fitnesses) {
            expect(fitness).toBe(100)
        }
    })

    it('should count Pitch.Holds as last non-Hold pitch', () => {
        const population = new Population({
            size: 1,
            genomeSize: 4,
            geneFactory: (i: number) => i ? Pitch.Hold : Pitch.C
        })
        const chords = { 0: [ Pitch.C ] }

        const fitness = chordFitFactory({ chords })(population)[0]

        expect(fitness).toBe(100)
    })

    it('should count initial Pitch.Hold as undefined note', () => {
        const population = new Population({
            size: 1,
            genomeSize: 4,
            geneFactory: (i: number) => i ? Pitch.C : Pitch.Hold
        })
        const chords = { 0: [ Pitch.C ] }

        const fitness = chordFitFactory({ chords })(population)[0]

        const expectedFitness = Math.round(((population.genomeSize - 1) / population.genomeSize) * 100)
        expect(fitness).toBe(expectedFitness)
    })

    it('should not count Pitch.Rests towards note total', () => {
        const population = new Population({
            size: 1,
            genomeSize: 4,
            geneFactory: (i: number) => i ? Pitch.C : Pitch.Rest
        })
        const chords = { 0: [ Pitch.C ] }

        const fitness = chordFitFactory({ chords })(population)[0]

        expect(fitness).toBe(100)
    })

    it('should count Pitch.Holds across chord boundaries correctly', () => {
        const population = new Population({
            size: 1,
            genomeSize: 4,
            geneFactory: (i: number) => i ? Pitch.Hold : Pitch.C
        })
        const chords = { 0: [ Pitch.C ], 2: [ Pitch.B ] }

        const fitness = chordFitFactory({ chords })(population)[0]

        expect(fitness).toBe(50)
    })

    const cases: { chords: { [i: number]: Pitch[] }, pitches: Pitch[], expectedFitness: number }[] = [
        {
            chords: {
                0: [ Pitch.C, Pitch.E, Pitch.F ],
                2: [ Pitch.B, Pitch.F, Pitch.G ]
            },
            pitches: [
                Pitch.Bb,
                Pitch.E,
                Pitch.F,
                Pitch.Hold
            ],
            expectedFitness: 75
        },
        {
            chords: {
                0: [ Pitch.C, Pitch.E, Pitch.F ],
                2: [ Pitch.B, Pitch.F, Pitch.G ]
            },
            pitches: [
                Pitch.E,
                Pitch.E,
                Pitch.Hold,
                Pitch.Hold
            ],
            expectedFitness: 50
        },
        {
            chords: {
                0: [ Pitch.C, Pitch.E, Pitch.F ],
                2: [ Pitch.B, Pitch.F, Pitch.G ]
            },
            pitches: [
                Pitch.Rest,
                Pitch.E,
                Pitch.Rest,
                Pitch.Hold
            ],
            expectedFitness: 100
        },
        {
            chords: {
                0: [ Pitch.C, Pitch.E, Pitch.F ],
                2: [ Pitch.B, Pitch.F, Pitch.G ]
            },
            pitches: [
                Pitch.Bb,
                Pitch.E,
                Pitch.Rest,
                Pitch.Hold
            ],
            expectedFitness: 50
        },
        {
            chords: {
                0: [ Pitch.C, Pitch.E, Pitch.F ],
                2: [ Pitch.B, Pitch.F, Pitch.G ]
            },
            pitches: [
                Pitch.Bb,
                Pitch.C,
                Pitch.C,
                Pitch.Rest
            ],
            expectedFitness: 33
        },
        {
            chords: {
                0: [
                    GeneUtil.createAtOctave(Pitch.C, 4),
                    GeneUtil.createAtOctave(Pitch.E, 4),
                    GeneUtil.createAtOctave(Pitch.F, 5)
                ],
                2: [
                    GeneUtil.createAtOctave(Pitch.B, 4),
                    GeneUtil.createAtOctave(Pitch.F, 4),
                    GeneUtil.createAtOctave(Pitch.G, 6)
                ]
            },
            pitches: [
                Pitch.Bb,
                Pitch.C,
                Pitch.C,
                Pitch.Rest
            ],
            expectedFitness: 33
        }
    ]

    const chordsToString = (chords: { [i: number]: Pitch[] }) => {
        return Object.keys(chords).map(index => `${index}: ${chords[Number.parseInt(index)]}`).join(' | ')
    }

    cases.forEach(({ chords, pitches, expectedFitness }) => {
        it(`should return ${expectedFitness} with chords: ${chordsToString(chords)} for genome: ${pitches}`, () => {
            const population = new Population({
                size: 1,
                genomeSize: pitches.length,
                geneFactory: (i: number) => pitches[i]
            })

            const fitness = chordFitFactory({ chords })(population)[0]

            expect(fitness).toBe(expectedFitness)
        })
    })
})

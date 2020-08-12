import { RandomIntegerGenerator } from '../../src/genetic-algorithm/random-integer-generator'
import { geneFactoryFactory } from '../../src/genetic-algorithm/gene-factory-factory'
import { GeneUtil } from '../../src/common/gene-util'
import { Pitch } from '../../src/common/pitch'

describe('geneFactoryFactory', () => {
    let randomIntegerSpy: jasmine.Spy<RandomIntegerGenerator>

    beforeEach(() => {
        randomIntegerSpy = jasmine.createSpy('randomIntegerGenerator', (min: number, _: number) => min)
            .and.callThrough()
    })

    it('should use minimum octave if given minOctave < GeneUtil.MIN_OCTAVE', () => {
        geneFactoryFactory({
            options: {
                octaveRange: [ GeneUtil.MIN_OCTAVE - 1, 1 ],
                excludedPitches: []
            },
            randomIntegerGenerator: randomIntegerSpy
        })(0)

        const minGene = randomIntegerSpy.calls.mostRecent().args[0]
        expect(minGene / GeneUtil.OCTAVE_LENGTH).toBe(0)
    })

    it('should use maximum octave if given maxOctave > GeneUtil.MAX_OCTAVE', () => {
        geneFactoryFactory({
            options: {
                octaveRange: [ GeneUtil.MIN_OCTAVE, GeneUtil.MAX_OCTAVE + 2 ],
                excludedPitches: []
            },
            randomIntegerGenerator: randomIntegerSpy
        })(0)

        const maxGene = randomIntegerSpy.calls.mostRecent().args[1]
        expect(maxGene / GeneUtil.OCTAVE_LENGTH).toBe(GeneUtil.MAX_OCTAVE + 1)
    })

    it('should use minOctave as maxOctave if given maxOctave < minOctave', () => {
        const minOctave = 3
        geneFactoryFactory({
            options: {
                octaveRange: [ minOctave, minOctave - 1 ],
                excludedPitches: []
            },
            randomIntegerGenerator: randomIntegerSpy
        })(0)

        const [ minGene, maxGene ] = randomIntegerSpy.calls.mostRecent().args
        expect(maxGene / GeneUtil.OCTAVE_LENGTH).toBe(minOctave + 1)
        expect(minGene / GeneUtil.OCTAVE_LENGTH).toBe(minOctave)
    })

    it('should allow Rests and Holds even if included in excludedPitches', () => {
        randomIntegerSpy.and.returnValues(Pitch.Hold, Pitch.Rest)
        const factory = geneFactoryFactory({
            options: {
                octaveRange: [ 0, 1 ],
                excludedPitches: [ Pitch.Hold, Pitch.Rest ]
            },
            randomIntegerGenerator: randomIntegerSpy
        })

        const hold = factory(0)
        const rest = factory(0)

        expect(hold).toBe(Pitch.Hold)
        expect(rest).toBe(Pitch.Rest)
    })

    it('should not include excludedPitches', () => {
        const excludedPitches = [ Pitch.C, Pitch.B, Pitch.A ]
        const expected = Pitch.G
        randomIntegerSpy.and.returnValues(...excludedPitches, (GeneUtil.OCTAVE_LENGTH * 3) + expected)

        const factory = geneFactoryFactory({
            options: {
                octaveRange: [ 3, 5 ],
                excludedPitches
            },
            randomIntegerGenerator: randomIntegerSpy
        })
        const gene = factory(0)

        expect(GeneUtil.getPitch(gene)).toBe(expected)
        expect(randomIntegerSpy).toHaveBeenCalledTimes(excludedPitches.length + 1)
    })
})

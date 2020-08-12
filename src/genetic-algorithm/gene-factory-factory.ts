import { GeneFactoryOptions } from './gene-factory-options'
import { RandomIntegerGenerator } from './random-integer-generator'
import { Uint8 } from '../common/uint8'
import { GeneUtil } from '../common/gene-util'
import { Pitch } from '../common/pitch'

export function geneFactoryFactory({
    options: { octaveRange: [ minOctave, maxOctave ], excludedPitches },
    randomIntegerGenerator
}: {
    options: GeneFactoryOptions,
    randomIntegerGenerator: RandomIntegerGenerator
}): (geneIndex: number) => Uint8 {
    minOctave = Math.max(minOctave || 0, GeneUtil.MIN_OCTAVE)
    maxOctave = Math.max(Math.min(maxOctave || 0, GeneUtil.MAX_OCTAVE), minOctave)
    // We always want to have Rest and Hold as options.
    // This also prevents excludedPitches from including all possible Pitches,
    // which would cause the while loop below to run forever.
    excludedPitches = excludedPitches.filter(pitch => pitch !== Pitch.Rest && pitch !== Pitch.Hold)
    const minGene = minOctave * GeneUtil.OCTAVE_LENGTH
    // This will include all pitches in maxOctave and add 1,
    // since randomIntegerGenerator's max is exclusive
    const maxGene = (maxOctave + 1) * GeneUtil.OCTAVE_LENGTH

    return (_: number) => {
        let gene: Uint8 | undefined
        while (gene === undefined || geneIsNotAllowed(gene, excludedPitches)) {
            gene = randomIntegerGenerator(minGene, maxGene) as Uint8
        }
        return gene
    }
}

function geneIsNotAllowed(gene: Uint8, excludedPitches: Pitch[]): boolean {
    return excludedPitches.indexOf(GeneUtil.getPitch(gene)) !== -1
}

import { Population } from '../population'
import { Uint8 } from '../../common/uint8'
import { GeneUtil } from '../../common/gene-util'
import { Pitch } from '../../common/pitch'

enum SequenceType {
    Ascending = 'ascending',
    Stable = 'stable',
    Descending = 'descending'
}

export function pitchSequenceDirectionFactory({
    sequenceLength = 3,
    scores = { [SequenceType.Ascending]: 0, [SequenceType.Stable]: 0, [SequenceType.Descending]: 0 }
}: {
    sequenceLength: number,
    scores: {
        [SequenceType.Ascending]: number,
        [SequenceType.Stable]: number,
        [SequenceType.Descending]: number
    }
}): (population: Population) => Int8Array {
    return (population: Population) => {
        sequenceLength = Math.max(2, sequenceLength)
        const results = new Int8Array(population.size)
        const maxScore = Math.max(...Object.keys(scores).map(key => scores[key as SequenceType] || 0))
        for (let genomeIndex = 0; genomeIndex < population.size; genomeIndex++) {
            const genome = population.get(genomeIndex)
            const noteGenes = genome.filter(gene => gene !== Pitch.Rest && gene !== Pitch.Hold)
            let score = 0
            for (let geneIndex = 0; geneIndex < noteGenes.length - (sequenceLength - 1); geneIndex++) {
                let currentGene = noteGenes[geneIndex] as Uint8
                let sequenceType: SequenceType | 'none' | undefined
                let sequenceCount = 1
                while (sequenceCount < sequenceLength) {
                    const nextGene = noteGenes[geneIndex + sequenceCount] as Uint8
                    const type = getSequenceType(currentGene, nextGene)
                    if (sequenceType && type !== sequenceType) {
                        sequenceType = 'none'
                        break
                    }
                    sequenceType = type
                    currentGene = nextGene
                    sequenceCount++
                }

                score += (sequenceType && sequenceType !== 'none' ? scores[sequenceType] || 0 : 0)
            }

            results[genomeIndex] = calculateFitness(score, noteGenes.length, sequenceLength, maxScore)
        }
        return results
    }
}

function getSequenceType(gene: Uint8, nextGene: Uint8): SequenceType {
    const octave = GeneUtil.getOctave(gene)
    const nextGeneOctave = GeneUtil.getOctave(nextGene)
    if (octave !== nextGeneOctave) {
        const octaveDifference = octave - nextGeneOctave
        if (octaveDifference === 0) { return SequenceType.Stable }
        return octaveDifference < 0 ? SequenceType.Ascending : SequenceType.Descending
    }

    const pitchDifference = GeneUtil.getPitch(gene) - GeneUtil.getPitch(nextGene)
    if (pitchDifference === 0) { return SequenceType.Stable }
    return pitchDifference < 0 ? SequenceType.Ascending : SequenceType.Descending
}

function calculateFitness(score: number, noteGeneCount: number, sequenceLength: number, maxScore: number): number {
    if (noteGeneCount <= sequenceLength - 1 || !maxScore) { return 0 }
    const maxTotalScore = (noteGeneCount - (sequenceLength - 1)) * maxScore
    return Math.round((score / maxTotalScore) * 100)
}

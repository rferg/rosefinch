import { Population } from '../population'
import { Pitch } from '../../common/pitch'
import { GeneUtil } from '../../common/gene-util'
import { Uint8 } from '../../common/uint8'
import { ScaleIntervalOptions } from './scale-interval-options'

export function scaleIntervalFactory({
    scale: { pitches },
    intervalScores
}: ScaleIntervalOptions): (population: Population) => Int8Array {
    return (population: Population) => {
        const results = new Int8Array(population.size)
        const maxIntervalScore = Math.max(...intervalScores)
        for (let genomeIndex = 0; genomeIndex < population.size; genomeIndex++) {
            const genome = population.get(genomeIndex)
            let noteGenesCount = 0
            let score = 0
            for (let geneIndex = 0; geneIndex < genome.length; geneIndex++) {
                const gene = genome[geneIndex]
                const pitch = GeneUtil.getPitch(gene as Uint8)
                if (pitch === Pitch.Rest || pitch === Pitch.Hold) {
                    continue
                }
                noteGenesCount++

                const geneScaleDegree = pitches.indexOf(pitch)
                if (geneScaleDegree === -1) {
                    continue
                }

                const nextPitch = getNextNote(genome, geneIndex)
                if (!nextPitch) {
                    continue
                }

                const nextScaleDegree = pitches.indexOf(nextPitch)
                if (nextScaleDegree === -1) {
                    continue
                }

                const interval = Math.abs(geneScaleDegree - nextScaleDegree)

                score += (interval < intervalScores.length && intervalScores[interval]) || 0
            }

            results[genomeIndex] = calculateFitness(score, noteGenesCount, maxIntervalScore)
        }
        return results
    }
}

function calculateFitness(score: number, noteGenesCount: number, maxIntervalScore: number): number {
    if (noteGenesCount <= 1 || !maxIntervalScore) { return 0 }
    const maxScore = (noteGenesCount - 1) * maxIntervalScore
    return Math.round((score / maxScore) * 100)
}

function getNextNote(genome: Uint8Array, currentNoteIndex: number): Pitch | null {
    for (let index = currentNoteIndex + 1; index < genome.length; index++) {
        const gene = genome[index]
        const pitch = GeneUtil.getPitch(gene as Uint8)
        if (pitch === Pitch.Rest || pitch === Pitch.Hold) {
            continue
        }
        return pitch
    }
    return null
}

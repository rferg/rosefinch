import { Pitch } from '../../common/pitch'
import { Population } from '../population'
import { GeneUtil } from '../../common/gene-util'
import { Uint8 } from '../../common/uint8'
import { ChordFitOptions } from './chord-fit-options'

export function chordFitFactory({
    chords = {}
}: ChordFitOptions): (population: Population) => Int8Array {
    return (population) => {
        const results = new Int8Array(population.size)
        for (let genomeIndex = 0; genomeIndex < population.size; genomeIndex++) {
            const genome = population.get(genomeIndex)
            let currentChord: Pitch[] = []
            let totalNotes = 0
            let totalFittingNotes = 0
            let lastNote: Pitch | undefined
            for (let geneIndex = 0; geneIndex < genome.length; geneIndex++) {
                let pitch: Pitch | undefined = GeneUtil.getPitch(genome[geneIndex] as Uint8)
                currentChord = chords[geneIndex] || currentChord
                if (pitch === Pitch.Hold) {
                    pitch = lastNote
                } else {
                    lastNote = pitch
                }
                totalFittingNotes += (pitchIsInChord(pitch, currentChord) ? 1 : 0)
                totalNotes += (pitch !== Pitch.Rest ? 1 : 0)
            }

            results[genomeIndex] = calculateFitness(totalNotes, totalFittingNotes)
        }
        return results
    }
}

function pitchIsInChord(pitch: Pitch | undefined, chord: Pitch[]): boolean {
    if (!pitch) { return false }
    return (chord || []).indexOf(pitch) !== -1
}

function calculateFitness(totalNotes: number, totalFittingNotes: number): number {
    if (!totalNotes) { return 0 }
    return Math.round((totalFittingNotes / totalNotes) * 100)
}

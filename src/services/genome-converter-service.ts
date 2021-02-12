import { Injectable } from 'cewdi'
import { GeneUtil } from '../common/gene-util'
import { Pitch } from '../common/pitch'
import { Uint8 } from '../common/uint8'
import { PlayableChord } from './playable-chord'
import { PlayableNote } from './playable-note'

@Injectable()
export class GenomeConverterService {

    convertGenesToPlayableSequence(genes: number[]): PlayableNote[] {
        return genes.reduce((result, gene) => {
            if (this.isHold(gene)) {
                if (result.length) { result[result.length - 1].numberOfShortestDurations++ }
            } else {
                const pitch = GeneUtil.getPitch(gene as Uint8)
                result.push({
                    pitch,
                    pitchName: Pitch[pitch],
                    octave: GeneUtil.getOctave(gene as Uint8),
                    numberOfShortestDurations: 1
                })
            }
            return result
        }, [] as PlayableNote[])
    }

    convertChordsToPlayableSequence(chords: number[][]): PlayableChord[] {
        return chords.reduce((result, chord) => {
            if (this.isHold(chord)) {
                if (result.length) { result[result.length - 1].numberOfShortestDurations++ }
            } else {
                const pitches = chord.map(p => GeneUtil.getPitch(p as Uint8))
                result.push({
                    pitches,
                    pitchNames: pitches.map(pitch => Pitch[pitch]),
                    octaves: chord.map(p => GeneUtil.getOctave(p as Uint8)),
                    numberOfShortestDurations: 1
                })
            }
            return result
        }, [] as PlayableChord[])
    }

    private isHold(pitchLike: number | number[]): boolean {
        if (Array.isArray(pitchLike)) {
            return GeneUtil.getPitch(pitchLike[0] as Uint8) === Pitch.Hold
        }
        return GeneUtil.getPitch(pitchLike as Uint8) === Pitch.Hold
    }
}

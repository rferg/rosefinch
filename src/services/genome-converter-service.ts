import { Injectable } from 'cewdi'
import { GeneUtil } from '../common/gene-util'
import { Pitch } from '../common/pitch'
import { Uint8 } from '../common/uint8'
import { PlayableNote } from './playable-note'

@Injectable()
export class GenomeConverterService {

    convertGenesToPlayableSequence(genes: number[]): PlayableNote[] {
        return genes.reduce((result, gene) => {
            const pitch = GeneUtil.getPitch(gene as Uint8)
            if (pitch === Pitch.Hold) {
                if (result.length) { result[result.length - 1].numberOfShortestDurations++ }
            } else {
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
}

import { Injectable } from 'cewdi'
import { Scale } from './scale'
import { Pitch } from '../common/pitch'
import { GeneUtil } from '../common/gene-util'
import { Uint8 } from '../common/uint8'

@Injectable()
export class ScaleService {
    private readonly scaleIntervalMap: { [scale in Scale]: number[] } = {
        [Scale.Chromatic]: [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ],
        [Scale.Major]: [ 2, 2, 1, 2, 2, 2 ],
        [Scale.NaturalMinor]: [ 2, 1, 2, 2, 1, 2 ],
        [Scale.Dorian]: [ 2, 1, 2, 2, 2, 1 ],
        [Scale.Phrygian]: [ 1, 2, 2, 2, 1, 2 ],
        [Scale.Lydian]: [ 2, 2, 2, 1, 2, 2 ],
        [Scale.Mixolydian]: [ 2, 2, 1, 2, 2, 1 ],
        [Scale.Aeolian]: [ 2, 1, 2, 2, 1, 2 ],
        [Scale.Locrian]: [ 1, 2, 2, 1, 2, 2 ],
        [Scale.MinorPentatonic]: [ 3, 2, 2, 3 ],
        [Scale.MajorPentatonic]: [ 2, 2, 3, 2 ],
        [Scale.Blues]: [ 3, 2, 1, 1, 3 ],
        [Scale.PhrygianDominant]: [ 1, 3, 1, 2, 1, 2 ]
    }

    getPitches(root: Pitch, scale: Scale): Pitch[] {
        if (root === Pitch.Rest || root === Pitch.Hold) { return [] }
        const intervals = this.scaleIntervalMap[scale]
        let currentPitch = GeneUtil.getPitch(root)
        const result = [ currentPitch ]
        for (let intervalIndex = 0; intervalIndex < intervals.length; intervalIndex++) {
            const interval = intervals[intervalIndex]
            let nextPitch = currentPitch + interval
            if (nextPitch >= Pitch.Hold) {
                // Add 2 to account for Rest and Hold and then get pitch by mod.
                nextPitch = GeneUtil.getPitch(nextPitch + 2 as Uint8)
            }
            result.push(nextPitch)
            currentPitch = nextPitch
        }
        return result
    }
}

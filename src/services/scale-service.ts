import { Injectable } from 'cewdi'
import { ScaleName } from './scale-name'
import { Pitch } from '../common/pitch'
import { GeneUtil } from '../common/gene-util'
import { Uint8 } from '../common/uint8'

@Injectable()
export class ScaleService {
    private readonly scaleIntervalMap: { [scale in ScaleName]: number[] } = {
        [ScaleName.Chromatic]: [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ],
        [ScaleName.Major]: [ 2, 2, 1, 2, 2, 2 ],
        [ScaleName.NaturalMinor]: [ 2, 1, 2, 2, 1, 2 ],
        [ScaleName.Dorian]: [ 2, 1, 2, 2, 2, 1 ],
        [ScaleName.Phrygian]: [ 1, 2, 2, 2, 1, 2 ],
        [ScaleName.Lydian]: [ 2, 2, 2, 1, 2, 2 ],
        [ScaleName.Mixolydian]: [ 2, 2, 1, 2, 2, 1 ],
        [ScaleName.Aeolian]: [ 2, 1, 2, 2, 1, 2 ],
        [ScaleName.Locrian]: [ 1, 2, 2, 1, 2, 2 ],
        [ScaleName.MinorPentatonic]: [ 3, 2, 2, 3 ],
        [ScaleName.MajorPentatonic]: [ 2, 2, 3, 2 ],
        [ScaleName.Blues]: [ 3, 2, 1, 1, 3 ],
        [ScaleName.PhrygianDominant]: [ 1, 3, 1, 2, 1, 2 ]
    }

    getPitches(root: Pitch, scale: ScaleName): Pitch[] {
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

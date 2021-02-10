import { Injectable } from 'cewdi'
import { ScaleName } from './scale-name'
import { Pitch } from '../common/pitch'
import { getSequenceFromIntervals } from './get-sequence-from-intervals'

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
        const intervals = this.scaleIntervalMap[scale]
        return getSequenceFromIntervals(root, intervals, true)
    }
}

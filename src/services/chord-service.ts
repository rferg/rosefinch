import { Injectable } from 'cewdi'
import { Pitch } from '../common/pitch'
import { ChordName } from './chord-name'
import { getSequenceFromIntervals } from './get-sequence-from-intervals'

@Injectable()
export class ChordService {
    private readonly chordIntervalMap: { [name in ChordName]: number[] } = {
        [ChordName.Major]: [ 4, 3 ],
        [ChordName.Minor]: [ 3, 4 ],
        [ChordName.Diminished]: [ 3, 3 ],
        [ChordName.DominantSeventh]: [ 4, 3, 3 ],
        [ChordName.MajorSeventh]: [ 4, 3, 4 ],
        [ChordName.MinorSeventh]: [ 3, 4, 3 ],
        [ChordName.MinorSeventhFlatFive]: [ 3, 3, 4 ]
    }

    getPitches(root: Pitch, chord: ChordName): Pitch[] {
        const intervals = this.chordIntervalMap[chord]
        return getSequenceFromIntervals(root, intervals)
    }
}

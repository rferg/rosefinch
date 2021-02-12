import { Pitch } from '../common/pitch'

export interface PlayableChord {
    pitches: Pitch[]
    pitchNames: string[]
    octaves: number[]
    numberOfShortestDurations: number
}

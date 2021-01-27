import { Pitch } from '../common/pitch'

export interface PlayableNote {
    pitch: Pitch
    pitchName: string
    octave: number
    numberOfShortestDurations: number
}

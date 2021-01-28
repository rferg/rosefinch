import { Pitch } from '../../common/pitch'

export interface DenominatedNote {
    pitch: Pitch,
    octave: number,
    durationInSixteenths: number
    originalNoteIndex: number
}

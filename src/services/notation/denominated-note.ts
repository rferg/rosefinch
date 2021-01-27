import { DurationDenomination } from '../../common/duration-denomination'
import { Pitch } from '../../common/pitch'

export interface DenominatedNote {
    pitch: Pitch,
    octave: number,
    duration: DurationDenomination
    originalNoteIndex: number
}

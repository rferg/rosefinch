import { DurationDenomination } from '../../common/duration-denomination'

export interface DenominatedNote {
    pitchName: string,
    octave: number,
    duration: DurationDenomination,
    originalNoteIndex: number
}

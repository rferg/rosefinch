import { Pitch } from '../../common/pitch'

export interface DenominatedNote {
    pitches: Pitch[],
    octaves: number[],
    durationInSixteenths: number
    originalNoteIndex: number
}

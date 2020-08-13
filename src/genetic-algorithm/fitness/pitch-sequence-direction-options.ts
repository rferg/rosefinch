import { PitchSequenceType } from './pitch-sequence-type'

export interface PitchSequenceDirectionOptions {
    sequenceLength: number,
    scores: {
        [PitchSequenceType.Ascending]: number,
        [PitchSequenceType.Stable]: number,
        [PitchSequenceType.Descending]: number
    }
}

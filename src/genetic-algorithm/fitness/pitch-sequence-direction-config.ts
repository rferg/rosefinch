import { FitnessConfigBase } from './fitness-config-base'
import { FitnessMethod } from './fitness-method'
import { PitchSequenceDirectionOptions } from './pitch-sequence-direction-options'

export interface PitchSequenceDirectionConfig extends FitnessConfigBase {
    method: FitnessMethod.PitchSequenceDirection,
    options: PitchSequenceDirectionOptions
}

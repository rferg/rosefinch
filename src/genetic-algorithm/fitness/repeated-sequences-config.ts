import { FitnessConfigBase } from './fitness-config-base'
import { FitnessMethod } from './fitness-method'
import { RepeatedSequencesOptions } from './repeated-sequences-factory'

export interface RepeatedSequencesConfig extends FitnessConfigBase {
    method: FitnessMethod.RepeatedSequences,
    options: {
        types: RepeatedSequencesOptions[]
    }
}

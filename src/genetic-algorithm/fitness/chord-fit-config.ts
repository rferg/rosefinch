import { FitnessConfigBase } from './fitness-config-base'
import { FitnessMethod } from './fitness-method'
import { ChordFitOptions } from './chord-fit-options'

export interface ChordFitConfig extends FitnessConfigBase {
    method: FitnessMethod.ChordFit,
    options: ChordFitOptions
}

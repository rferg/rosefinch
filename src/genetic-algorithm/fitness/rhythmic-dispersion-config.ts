import { FitnessConfigBase } from './fitness-config-base'
import { FitnessMethod } from './fitness-method'
import { RhythmicDispersionOptions } from './rhythmic-dispersion-options'

export interface RhythmicDispersionConfig extends FitnessConfigBase {
    method: FitnessMethod.RhythmicDispersion,
    options: RhythmicDispersionOptions
}

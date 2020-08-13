import { FitnessConfigBase } from './fitness-config-base'
import { FitnessMethod } from './fitness-method'
import { ScaleIntervalOptions } from './scale-interval-options'

export interface ScaleIntervalConfig extends FitnessConfigBase {
    method: FitnessMethod.ScaleInterval,
    options: ScaleIntervalOptions
}

import { FitnessConfigBase } from './fitness-config-base'
import { FitnessMethod } from './fitness-method'
import { RestProportionOptions } from './rest-proportion-options'

export interface RestProportionConfig extends FitnessConfigBase {
    method: FitnessMethod.RestProportion,
    options: RestProportionOptions
}

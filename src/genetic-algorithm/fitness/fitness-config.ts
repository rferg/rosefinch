import { FitnessMethod } from './fitness-method'

export interface FitnessConfig {
    method: FitnessMethod,
    options: { [key: string]: any }
    weight?: number
}

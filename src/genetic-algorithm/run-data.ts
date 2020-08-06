import { Population } from './population'

export interface RunData {
    population: Population,
    fitnessValues: Int8Array,
    generation: number
}

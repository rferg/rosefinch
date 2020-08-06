import { Population } from '../population'
import { ParentSelectionMethod } from './parent-selection-method'
import { RandomIntegerGenerator } from '../random-integer-generator'
import { tournamentSelectionFactory } from './tournament-selection-factory'

export function parentSelectionFunctionFactory({
    method,
    randomInteger,
    tournamentSize
}: {
    method: ParentSelectionMethod,
    randomInteger: RandomIntegerGenerator
    tournamentSize?: number
}): (population: Population, fitnessValues: Int8Array) => Population {
    switch (method) {
        case ParentSelectionMethod.Tournament:
            return tournamentSelectionFactory({ randomInteger, tournamentSize: tournamentSize || 2 })
        default:
            throw new Error(`Invalid parent selection method: ${method}`)
    }
}

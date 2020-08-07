import { Population } from '../population'
import { SelectionMethod } from './selection-method'
import { RandomIntegerGenerator } from '../random-integer-generator'
import { tournamentSelectionFactory } from './tournament-selection-factory'

export function selectionFunctionFactory({
    method,
    randomInteger,
    tournamentSize
}: {
    method: SelectionMethod,
    randomInteger: RandomIntegerGenerator
    tournamentSize?: number
}): (population: Population, fitnessValues: Int8Array) => Population {
    switch (method) {
        case SelectionMethod.Tournament:
            return tournamentSelectionFactory({ randomInteger, tournamentSize: tournamentSize || 2 })
        default:
            throw new Error(`Invalid parent selection method: ${method}`)
    }
}

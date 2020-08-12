import { Population } from '../population'
import { SelectionMethod } from './selection-method'
import { RandomIntegerGenerator } from '../random-integer-generator'
import { tournamentSelectionFactory } from './tournament-selection-factory'
import { SelectionConfig } from './selection-config'

export function selectionFunctionFactory({
    config: { method, tournamentSize },
    randomInteger
}: {
    config: SelectionConfig,
    randomInteger: RandomIntegerGenerator
}): (population: Population, fitnessValues: Int8Array) => Population {
    switch (method) {
        case SelectionMethod.Tournament:
            return tournamentSelectionFactory({ randomInteger, tournamentSize: tournamentSize || 2 })
        default:
            throw new Error(`Invalid parent selection method: ${method}`)
    }
}

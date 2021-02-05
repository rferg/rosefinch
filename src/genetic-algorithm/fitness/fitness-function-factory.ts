import { FitnessConfig } from './fitness-config'
import { Population } from '../population'
import { FitnessMethod } from './fitness-method'
import { fitnessFunctionComposer } from './fitness-function-composer'
import { Normalizer } from '../../common/normalizer'
import { chordFitFactory } from './chord-fit-factory'
import { restProportionFactory } from './rest-proportion-factory'
import { pitchSequenceDirectionFactory } from './pitch-sequence-direction-factory'
import { scaleIntervalFactory } from './scale-interval-factory'
import { rhythmicDispersionFactory } from './rhythmic-dispersion-factory'
import { repeatedSequencesFactory } from './repeated-sequences-factory'
import { assertUnreachable } from '../../common/assert-unreachable'

export function fitnessFunctionFactory({
    configs,
    normalizer
}: {
    configs: FitnessConfig[],
    normalizer: Normalizer
}): (population: Population) => Int8Array {
    const functions = configs.map(({ method, options }) => getFunction(method, options))
    const weights = configs.map(({ weight }) => weight ?? 1)
    return fitnessFunctionComposer({ functions, weights, normalizer })
}

function getFunction(
    method: FitnessMethod,
    options?: { [key: string]: any }): (population: Population) => Int8Array {
    switch (method) {
        case FitnessMethod.ChordFit:
            return chordFitFactory({
                chords: options?.chords || {}
            })
        case FitnessMethod.RestProportion:
            return restProportionFactory({
                targetProportion: options?.targetProportion || 0.05
            })
        case FitnessMethod.PitchSequenceDirection:
            return pitchSequenceDirectionFactory({
                sequenceLength: options?.sequenceLength || 3,
                scores: options?.scores || {}
            })
        case FitnessMethod.ScaleInterval:
            return scaleIntervalFactory({
                scale: options?.scale || [],
                intervalScores: options?.intervalScores || []
            })
        case FitnessMethod.RhythmicDispersion:
            return rhythmicDispersionFactory({
                target: options?.target ?? 0
            })
        case FitnessMethod.RepeatedSequences:
            return repeatedSequencesFactory({
                minLength: options?.minLength || 3,
                maxLength: options?.maxLength || 6,
                type: options?.type || 1
            })
        default:
            assertUnreachable(method, `Invalid fitness function method ${method}!`)
    }
}

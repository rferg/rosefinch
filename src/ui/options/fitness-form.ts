import {
    ChordFitOptions,
    PitchSequenceDirectionOptions,
    RestProportionOptions,
    RhythmicDispersionOptions,
    ScaleIntervalOptions
} from '../../genetic-algorithm/index'

export interface FitnessForm {
    chords: { weight: number, options?: ChordFitOptions },
    scale: { weight: number, options?: ScaleIntervalOptions },
    restProportion: { weight: number, options?: RestProportionOptions },
    pitchSequence: { weight: number, options?: PitchSequenceDirectionOptions },
    rhythmicDispersion: { weight: number, options?: RhythmicDispersionOptions }
}

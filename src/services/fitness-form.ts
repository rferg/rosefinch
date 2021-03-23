import {
    ChordFitConfig,
    PitchSequenceDirectionConfig,
    RepeatedSequencesConfig,
    RestProportionConfig,
    RhythmicDispersionConfig,
    ScaleIntervalConfig
} from '../genetic-algorithm'

export interface FitnessForm {
    chords: ChordFitConfig
    scale: ScaleIntervalConfig
    restProportion: RestProportionConfig
    pitchSequence: PitchSequenceDirectionConfig
    rhythmicDispersion: RhythmicDispersionConfig,
    repeatedSequences: RepeatedSequencesConfig
}

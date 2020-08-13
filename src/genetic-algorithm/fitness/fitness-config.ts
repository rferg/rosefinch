import { ChordFitConfig } from './chord-fit-config'
import { PitchSequenceDirectionConfig } from './pitch-sequence-direction-config'
import { RestProportionConfig } from './rest-proportion-config'
import { RhythmicDispersionConfig } from './rhythmic-dispersion-config'
import { ScaleIntervalConfig } from './scale-interval-config'

export type FitnessConfig = ChordFitConfig
    | PitchSequenceDirectionConfig
    | RestProportionConfig
    | RhythmicDispersionConfig
    | ScaleIntervalConfig

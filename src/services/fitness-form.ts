import { ChordFitConfig } from '../genetic-algorithm/fitness/chord-fit-config'
import { PitchSequenceDirectionConfig } from '../genetic-algorithm/fitness/pitch-sequence-direction-config'
import { RestProportionConfig } from '../genetic-algorithm/fitness/rest-proportion-config'
import { RhythmicDispersionConfig } from '../genetic-algorithm/fitness/rhythmic-dispersion-config'
import { ScaleIntervalConfig } from '../genetic-algorithm/fitness/scale-interval-config'

export interface FitnessForm {
    chords: ChordFitConfig
    scale: ScaleIntervalConfig
    restProportion: RestProportionConfig
    pitchSequence: PitchSequenceDirectionConfig
    rhythmicDispersion: RhythmicDispersionConfig
}

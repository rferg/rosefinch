import { Pitch } from '../common/pitch'

export interface GeneFactoryOptions {
    octaveRange: [number, number]
    excludedPitches: Pitch[]
}

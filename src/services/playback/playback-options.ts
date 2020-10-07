import { Instrument } from './instrument'

export interface PlaybackOptions {
    bpm?: number
    instrument?: Instrument
    loop?: boolean
}

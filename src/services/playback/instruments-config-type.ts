import { Instrument } from './instrument'
import { PlaybackInstrument } from './playback-instrument'

export type InstrumentsConfigType = {
    [k in Instrument]: {
        loader: () => Promise<PlaybackInstrument>
    }
}

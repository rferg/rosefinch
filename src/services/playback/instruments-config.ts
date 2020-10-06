import { Sampler, Synth } from 'tone'
import { Instrument } from './instrument'
import { InstrumentsConfigType } from './instruments-config-type'

export const instrumentsConfig: InstrumentsConfigType = {
    [Instrument.Synth]: {
        loader: () => Promise.resolve(new Synth().toDestination())
    },
    [Instrument.Piano]: {
        loader: () => {
            const urls: { [key: string]: string } = {}
            for (let octave = 0; octave < 8; octave++) {
                urls[`A${octave}`] = `A${octave}.mp3`
            }
            return new Promise((resolve, reject) => {
                const sampler = new Sampler({
                    urls,
                    baseUrl: 'piano/',
                    onload: () => {
                        resolve(sampler.toDestination())
                    },
                    onerror: err => {
                        reject(`Unable to load piano due to: ${err}`)
                    }
                })
            })
        }
    }
}

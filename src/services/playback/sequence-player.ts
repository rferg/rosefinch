import { Inject, Injectable } from 'cewdi'
import { Part } from 'tone'
import { Pitch } from '../../common/pitch'
import { PlayableNote } from '../playable-note'
import { Instrument } from './instrument'
import { instrumentsConfigToken } from './instruments-config-token'
import { InstrumentsConfigType } from './instruments-config-type'
import { PlaybackCallbacks } from './playback-callbacks'
import { PlaybackControls } from './playback-controls'
import { PlaybackInstrument } from './playback-instrument'
import { PlaybackOptions } from './playback-options'
import { ToneWrapper } from './tone-wrapper'

type PartValueType = { time: number, note: string | null, duration: number, index: number, isDone: boolean }

@Injectable()
export class SequencePlayer {
    private hasStarted = false
    private readonly instruments = new Map<Instrument, PlaybackInstrument>()
    private readonly defaultInstrument = Instrument.Synth
    private currentInstrument?: { type: Instrument, instance: PlaybackInstrument }

    constructor(
        private readonly tone: ToneWrapper,
        @Inject(instrumentsConfigToken) private readonly instrumentsConfig: InstrumentsConfigType) { }

    async setupSequence({
        sequence,
        shortestNoteDuration,
        options,
        callbacks
    }: {
        sequence: PlayableNote[],
        shortestNoteDuration: 1 | 2 | 4 | 8 | 16,
        options: PlaybackOptions,
        callbacks: PlaybackCallbacks
    }): Promise<PlaybackControls> {
        if (!sequence?.length) {
            return Promise.reject('Cannot play empty sequence.')
        }

        if (!this.hasStarted) {
            await this.tone.start()
            this.hasStarted = true
        }

        this.clearTransport()
        await this.updateOptions(options)

        const baseTime = this.tone.getTime(shortestNoteDuration + 'n').toSeconds()
        const part = this.scheduleSequence(baseTime, sequence, !!options.loop, callbacks)

        return {
            play: () => {
                part.start()
            },
            pause: () => {
                part.stop()
            }
        }
    }

    private async updateOptions({ bpm, instrument }: PlaybackOptions): Promise<void> {
        if (bpm) {
            this.tone.transport.bpm.value = Math.abs(bpm)
        }

        if (!this.currentInstrument || instrument !== this.currentInstrument?.type) {
            const instance = await this.loadInstrument(instrument || this.defaultInstrument)
            if (instance) {
                this.currentInstrument = { type: instrument || this.defaultInstrument, instance }
            }
        }
    }

    private clearTransport() {
        this.tone.transport.stop()
        this.tone.transport.position = 0
        this.tone.transport.cancel()
        this.tone.transport.start()
    }

    private getNote(pitchName: string, octave: number): string | null {
        if (pitchName === Pitch[Pitch.Rest] || pitchName === Pitch[Pitch.Hold]) { return null }
        return `${pitchName}${octave}`
    }

    private scheduleSequence(
        baseTime: number,
        sequence: PlayableNote[],
        loop: boolean,
        { onNoteChange }: PlaybackCallbacks): Part {
        let time = 0
        const timeNotes: PartValueType[] = []
        sequence.forEach(({ pitchName, octave, numberOfShortestDurations }, index) => {
            const duration = baseTime * numberOfShortestDurations
            const note = this.getNote(pitchName, octave)
            timeNotes.push({ time, note, duration, index, isDone: false })
            time += duration
        })
        // Add sequence termination indicator.
        // Part constructor callback sorts by time, so add to last time point to make sure
        // this comes last.
        timeNotes.push({ time: time + 1, note: '', duration: 0, index: sequence.length, isDone: true })

        const part = this.tone.getPart<PartValueType>((time, { note, duration, index, isDone }) => {
            if (note && this.currentInstrument) {
                this.currentInstrument.instance.triggerAttackRelease(note, duration, time)
            }
            if (onNoteChange) { onNoteChange(note || '', index, isDone) }
        }, timeNotes)
        part.loopStart = 0
        part.loopEnd = time
        part.loop = loop
        return part
    }

    private async loadInstrument(instrument: Instrument): Promise<PlaybackInstrument | undefined> {
        if (!this.instruments.has(instrument)) {
            const instance = await this.instrumentsConfig[instrument].loader()
            this.instruments.set(instrument, instance)
        }
        return Promise.resolve(this.instruments.get(instrument))
    }
}

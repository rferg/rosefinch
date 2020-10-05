import { Injectable } from 'cewdi'
import * as Tone from 'tone'
import { Pitch } from '../../common/pitch'
import { PlayableNote } from '../playable-note'
import { Instrument } from './instrument'
import { PlaybackCallbacks } from './playback-callbacks'
import { PlaybackControls } from './playback-controls'
import { PlaybackOptions } from './playback-options'

type PlayerInstrument = Tone.Synth | Tone.Sampler
type PartValueType = { time: number, note: string | null, duration: number, index: number, isDone: boolean }

@Injectable()
export class SequencePlayer {
    private hasStarted = false
    private readonly instruments = new Map<Instrument, PlayerInstrument>()
    private currentInstrument: { type: Instrument, instance: PlayerInstrument }

    constructor() {
        this.currentInstrument = {
            type: Instrument.Synth,
            instance: new Tone.Synth().toDestination()
        }
        this.instruments.set(this.currentInstrument.type, this.currentInstrument.instance)
        // TODO: SETUP PIANO SAMPLER
    }

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
            throw new Error('Cannot play empty sequence.')
        }

        if (!this.hasStarted) {
            await Tone.start()
            this.hasStarted = true
        }

        this.clearTransport()
        this.updateOptions(options)

        const baseTime = Tone.Time(shortestNoteDuration + 'n').toSeconds()
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

    private updateOptions({ bpm, instrument }: PlaybackOptions) {
        if (bpm) {
            Tone.Transport.bpm.value = Math.abs(bpm)
        }

        if (instrument && instrument !== this.currentInstrument.type) {
            const instance = this.instruments.get(instrument)
            if (instance) {
                this.currentInstrument = { type: instrument, instance }
            }
        }
    }

    private clearTransport() {
        Tone.Transport.stop()
        Tone.Transport.position = 0
        Tone.Transport.cancel()
        Tone.Transport.start()
    }

    private getNote(pitchName: string, octave: number): string | null {
        if (pitchName === Pitch[Pitch.Rest] || pitchName === Pitch[Pitch.Hold]) { return null }
        return `${pitchName}${octave}`
    }

    private scheduleSequence(
        baseTime: number,
        sequence: PlayableNote[],
        loop: boolean,
        { onNoteChange }: PlaybackCallbacks): Tone.Part {
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

        const part = new Tone.Part<PartValueType>((time, { note, duration, index, isDone }) => {
            if (note) {
                this.currentInstrument.instance.triggerAttackRelease(note, duration, time)
            }
            if (onNoteChange) { onNoteChange(note || '', index, isDone) }
        }, timeNotes)
        part.loopStart = 0
        part.loopEnd = time
        part.loop = loop
        return part
    }
}

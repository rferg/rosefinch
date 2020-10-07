import { Part, Sampler, Synth, TimeClass, ToneEventCallback, Transport } from 'tone'
import { TickParam } from 'tone/build/esm/core/clock/TickParam'
import { Pitch } from '../../../src/common/pitch'
import { PlayableNote } from '../../../src/services/playable-note'
import { Instrument, PlaybackOptions } from '../../../src/services/playback'
import { InstrumentsConfigType } from '../../../src/services/playback/instruments-config-type'
import { PlaybackCallbacks } from '../../../src/services/playback/playback-callbacks'
import { SequencePlayer } from '../../../src/services/playback/sequence-player'
import { ToneWrapper } from '../../../src/services/playback/tone-wrapper'

type CallbackValue = { time: number, note: string | null, duration: number, index: number, isDone: boolean }

describe('SequencePlayer', () => {
    let tone: jasmine.SpyObj<ToneWrapper>
    let instrumentConfig: InstrumentsConfigType
    let player: SequencePlayer
    let partSpy: jasmine.SpyObj<Part>
    let synthSpy: jasmine.SpyObj<Synth>
    let pianoSpy: jasmine.SpyObj<Sampler>
    let transportSpy: jasmine.SpyObj<typeof Transport>
    const baseTime = 1

    beforeEach(() => {
        partSpy = jasmine.createSpyObj<Part>(
            'Part',
            [ 'start', 'stop' ],
            {
                loopStart: 0,
                loopEnd: 0,
                loop: false
            }
        )
        transportSpy = jasmine.createSpyObj<typeof Transport>(
            'Transport',
            [ 'start', 'stop', 'cancel' ],
            {
                bpm: { value: 0 } as TickParam<'bpm'>,
                position: 0
            })
        tone = jasmine.createSpyObj<ToneWrapper>(
            'ToneWrapper',
            [ 'getPart', 'start', 'getTime' ],
            { transport: transportSpy })
        tone.getPart.and.returnValue(partSpy)
        tone.getTime.and.returnValue({ toSeconds: () => baseTime } as TimeClass)

        synthSpy = jasmine.createSpyObj<Synth>('Synth', [ 'triggerAttackRelease' ])
        pianoSpy = jasmine.createSpyObj<Sampler>('Sampler(Piano)', [ 'triggerAttackRelease' ])
        instrumentConfig = {
            [Instrument.Synth]: { loader: () => Promise.resolve(synthSpy) },
            [Instrument.Piano]: { loader: () => Promise.resolve(pianoSpy) }
        }

        player = new SequencePlayer(tone, instrumentConfig)
    })

    describe('setupSequence', () => {
        const defaultParameters: {
            sequence: PlayableNote[],
            shortestNoteDuration: 1 | 2 | 4 | 8 | 16,
            options: PlaybackOptions,
            callbacks: PlaybackCallbacks
        } = {
            sequence: [ { pitchName: Pitch[Pitch.C], octave: 0, numberOfShortestDurations: 1 } ],
            shortestNoteDuration: 1,
            options: {},
            callbacks: {}
        }

        it('should throw if given empty sequence', async () => {
            await expectAsync(player.setupSequence({
                sequence: [],
                shortestNoteDuration: 1,
                options: {},
                callbacks: {}
            }))
                .toBeRejectedWith('Cannot play empty sequence.')
        })

        it('should start tone audio context', async () => {
            await player.setupSequence(defaultParameters)

            expect(tone.start).toHaveBeenCalled()
        })

        it('should only start tone audio context once', async () => {
            await player.setupSequence(defaultParameters)
            await player.setupSequence(defaultParameters)

            expect(tone.start).toHaveBeenCalledTimes(1)
        })

        it('should reset transport', async () => {
            await player.setupSequence(defaultParameters)

            expect(transportSpy.stop)
                .toHaveBeenCalledBefore(transportSpy.start)
            expect(transportSpy.cancel).toHaveBeenCalledBefore(tone.getPart)
        })

        it('should update bpm if given', async () => {
            const bpm = 9
            await player.setupSequence({
                ...defaultParameters,
                options: { ...defaultParameters.options, bpm }
            })

            expect(tone.transport.bpm.value).toEqual(bpm)
        })

        it('should load Synth as default instrument initially if not specified in options', async () => {
            const loaderSpy = spyOn(instrumentConfig.Synth, 'loader').and.callThrough()

            await player.setupSequence({
                ...defaultParameters,
                options: { ...defaultParameters.options, instrument: undefined }
            })

            expect(loaderSpy).toHaveBeenCalled()
        })

        it('should load instrument if given', async () => {
            const instrument = Instrument.Piano
            const loaderSpy = spyOn(instrumentConfig[instrument], 'loader').and.callThrough()

            await player.setupSequence({
                ...defaultParameters,
                options: { ...defaultParameters.options, instrument }
            })

            expect(loaderSpy).toHaveBeenCalled()
        })

        it('should only load the same instrument once', async () => {
            const instrument = Instrument.Piano
            const loaderSpy = spyOn(instrumentConfig[instrument], 'loader').and.callThrough()

            await player.setupSequence({
                ...defaultParameters,
                options: { ...defaultParameters.options, instrument }
            })
            await player.setupSequence({
                ...defaultParameters,
                options: { ...defaultParameters.options, instrument }
            })

            expect(loaderSpy).toHaveBeenCalledTimes(1)
        })

        it('should return play and pause controls that play and pause Part', async () => {
            const controls = await player.setupSequence(defaultParameters)

            controls.play()
            expect(partSpy.start).toHaveBeenCalled()

            controls.pause()
            expect(partSpy.stop).toHaveBeenCalled()
        })

        describe('Part callback', () => {
            let callback: ToneEventCallback<CallbackValue>
            let callbackValues: CallbackValue[]
            const sequence: PlayableNote[] = [
                {
                    pitchName: Pitch[Pitch.C],
                    octave: 4,
                    numberOfShortestDurations: 2
                },
                {
                    pitchName: Pitch[Pitch.Rest],
                    octave: 3,
                    numberOfShortestDurations: 1
                },
                {
                    pitchName: Pitch[Pitch.B],
                    octave: 3,
                    numberOfShortestDurations: 1
                }
            ]
            const instrument = Instrument.Piano
            let instrumentSpy: jasmine.SpyObj<Sampler | Synth>
            let onNoteChangeSpy: jasmine.Spy

            beforeEach(async () => {
                onNoteChangeSpy = jasmine.createSpy('onNoteChange')
                await player.setupSequence({
                    ...defaultParameters,
                    sequence,
                    options: { ...defaultParameters.options, instrument },
                    callbacks: { onNoteChange: onNoteChangeSpy }
                })

                const args = tone.getPart.calls.mostRecent().args
                callbackValues = args[1] as CallbackValue[]
                callback = args[0]
                instrumentSpy = pianoSpy
            })

            it('should create correct values for Part callback', () => {
                expect(callbackValues.length).toEqual(sequence.length + 1)

                sequence.forEach(({ pitchName, octave, numberOfShortestDurations }, i) => {
                    const callbackValue = callbackValues[i]
                    expect(callbackValue.index).toEqual(i)
                    expect(callbackValue.note).toEqual(
                        pitchName === Pitch[Pitch.Rest]
                            ? null
                            : `${pitchName}${octave}`
                    )
                    expect(callbackValue.duration).toEqual(numberOfShortestDurations * baseTime)
                    expect(callbackValue.isDone).toBe(false)
                })

                const terminatingValue = callbackValues[callbackValues.length - 1]
                expect(terminatingValue.note).toBeFalsy()
                expect(terminatingValue.isDone).toBe(true)
            })

            it('should triggerAttackRelease with if note is truthy', () => {
                const value: CallbackValue = { time: 0, index: 0, note: 'C4', duration: 1, isDone: false }

                callback(value.time, value)

                expect(instrumentSpy.triggerAttackRelease).toHaveBeenCalledWith(
                    value.note,
                    value.duration,
                    value.time
                )
            })

            it('should not triggerAttackRelease if note falsy', () => {
                const value: CallbackValue = { time: 0, index: 0, note: '', duration: 1, isDone: false }

                callback(value.time, value)

                expect(instrumentSpy.triggerAttackRelease).not.toHaveBeenCalled()
            })

            it('should call onNoteChange callback on note if provided', () => {
                const value: CallbackValue = { time: 0, index: 0, note: 'C4', duration: 1, isDone: false }

                callback(value.time, value)

                expect(onNoteChangeSpy).toHaveBeenCalledWith(
                    value.note,
                    value.index,
                    value.isDone
                )
            })
        })
    })
})

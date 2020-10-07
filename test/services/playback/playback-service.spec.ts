import { Pitch } from '../../../src/common/pitch'
import { GenomeConverterService } from '../../../src/services/genome-converter-service'
import { PlayableNote } from '../../../src/services/playable-note'
import { Instrument, PlaybackControls, PlaybackOptions, PlaybackService } from '../../../src/services/playback'
import { PlaybackCallbacks } from '../../../src/services/playback/playback-callbacks'
import { SequencePlayer } from '../../../src/services/playback/sequence-player'

describe('PlaybackService', () => {
    let converter: jasmine.SpyObj<GenomeConverterService>
    let player: jasmine.SpyObj<SequencePlayer>
    let service: PlaybackService

    beforeEach(() => {
        converter = jasmine.createSpyObj<GenomeConverterService>(
            'GenomeConverterService',
            [ 'convertGenesToPlayableSequence' ])
        player = jasmine.createSpyObj<SequencePlayer>(
            'SequencePlayer',
            [ 'setupSequence' ])
        service = new PlaybackService(converter, player)
    })

    describe('setupSequence', () => {
        const controls: PlaybackControls = { play: () => {}, pause: () => {} }
        const sequence: PlayableNote[] = [ { numberOfShortestDurations: 1, pitchName: 'C', octave: 0 } ]

        beforeEach(() => {
            player.setupSequence.and.returnValue(Promise.resolve(controls))
            converter.convertGenesToPlayableSequence.and.returnValue(sequence)
        })

        it('should pass converted genome, options, and callbacks to player.setupSequence', async () => {
            const options: PlaybackOptions = { loop: true, bpm: 1, instrument: Instrument.Piano }
            const callbacks: PlaybackCallbacks = { onNoteChange: () => {} }
            const genes = [ Pitch.C ]
            const shortestNoteDuration = 1

            const result = await service.setupSequence({
                genes,
                shortestNoteDuration,
                options,
                callbacks
            })

            expect(result).toEqual(controls)
            expect(converter.convertGenesToPlayableSequence).toHaveBeenCalledWith(genes)
            expect(player.setupSequence).toHaveBeenCalledWith({
                sequence,
                shortestNoteDuration,
                options,
                callbacks
            })
        })

        it('should use default options if none provided', async () => {
            const expectedOptions: PlaybackOptions = {
                bpm: 120,
                instrument: Instrument.Synth,
                loop: false
            }

            await service.setupSequence({
                genes: [ Pitch.C ],
                shortestNoteDuration: 1,
                callbacks: { onNoteChange: () => {} }
            })

            expect(player.setupSequence.calls.mostRecent().args[0].options).toEqual(expectedOptions)
        })

        it('should use default callbacks if none provided', async () => {
            const expectedCallbacks: PlaybackCallbacks = {}

            await service.setupSequence({
                genes: [ Pitch.C ],
                shortestNoteDuration: 1
            })

            expect(player.setupSequence.calls.mostRecent().args[0].callbacks).toEqual(expectedCallbacks)
        })
    })
})

import { Injectable } from 'cewdi'
import { Instrument } from './instrument'
import { PlaybackOptions } from './playback-options'
import { GenomeConverterService } from '../genome-converter-service'
import { SequencePlayer } from './sequence-player'
import { PlaybackControls } from './playback-controls'
import { PlaybackCallbacks } from './playback-callbacks'

@Injectable()
export class PlaybackService {
    private readonly defaultOptions: PlaybackOptions = {
        bpm: 120,
        instrument: Instrument.Synth,
        loop: false
    }

    constructor(
        private readonly genomeConverter: GenomeConverterService,
        private readonly player: SequencePlayer) {}

    setupSequence({
        genes,
        shortestNoteDuration,
        options = this.defaultOptions,
        callbacks = {}
    }: {
        genes: number[],
        shortestNoteDuration: 1 | 2 | 4 | 8 | 16,
        options?: PlaybackOptions,
        callbacks?: PlaybackCallbacks
    }): Promise<PlaybackControls> {
        const sequence = this.genomeConverter.convertGenesToPlayableSequence(genes)
        return this.player.setupSequence({ sequence, shortestNoteDuration, options, callbacks })
    }
}

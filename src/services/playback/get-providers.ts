import { Provider } from 'cewdi'
import { GenomeConverterService } from '../genome-converter-service'
import { PlaybackService } from './playback-service'
import { SequencePlayer } from './sequence-player'

export function getProviders(): Provider[] {
    return [
        GenomeConverterService,
        PlaybackService,
        SequencePlayer
    ]
}

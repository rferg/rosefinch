import { ExplicitProvider, Provider } from 'cewdi'
import { GenomeConverterService } from '../genome-converter-service'
import { instrumentsConfig } from './instruments-config'
import { instrumentsConfigToken } from './instruments-config-token'
import { PlaybackService } from './playback-service'
import { SequencePlayer } from './sequence-player'
import { ToneWrapper } from './tone-wrapper'

export function getProviders(): Provider[] {
    return [
        GenomeConverterService,
        PlaybackService,
        SequencePlayer,
        new ExplicitProvider(instrumentsConfigToken, instrumentsConfig),
        ToneWrapper
    ]
}

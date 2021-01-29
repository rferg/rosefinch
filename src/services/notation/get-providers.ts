import { Provider } from 'cewdi'
import { GenomeConverterService } from '../genome-converter-service'
import { AbcNotationRenderer } from './abc-notation-renderer'
import { MeasureSplitter } from './measure-splitter'
import { NotationService } from './notation-service'

export function getProviders(): Provider[] {
    return [
        GenomeConverterService,
        NotationService,
        MeasureSplitter,
        AbcNotationRenderer
    ]
}

import { Provider } from 'cewdi'
import { GenomeConverterService } from '../genome-converter-service'
import { AbcJSWrapper } from './abcjs-wrapper'
import { MeasureSplitter } from './measure-splitter'
import { NotationService } from './notation-service'

export function getProviders(): Provider[] {
    return [
        GenomeConverterService,
        NotationService,
        MeasureSplitter,
        AbcJSWrapper
    ]
}

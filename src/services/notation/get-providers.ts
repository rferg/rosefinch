import { Provider } from 'cewdi'
import { GenomeConverterService } from '../genome-converter-service'
import { MeasureSplitter } from './measure-splitter'
import { NotationService } from './notation-service'
import { NoteDrawer } from './note-drawer'

export function getProviders(): Provider[] {
    return [
        GenomeConverterService,
        NotationService,
        MeasureSplitter,
        NoteDrawer
    ]
}

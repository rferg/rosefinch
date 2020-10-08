import { Provider } from 'cewdi'
import { GenomeConverterService } from '../genome-converter-service'
import { NotationRenderer } from './notation-renderer'
import { NotationService } from './notation-service'

export function getProviders(): Provider[] {
    return [
        GenomeConverterService,
        NotationService,
        NotationRenderer
    ]
}

import { Injectable } from 'cewdi'
import { GenomeConverterService } from '../genome-converter-service'
import { NotationRenderer } from './notation-renderer'

@Injectable()
export class NotationService {
    constructor(
        private readonly genomeConverter: GenomeConverterService,
        private readonly renderer: NotationRenderer) { }

    renderGenes({
        elementId,
        genes,
        timeSignature,
        shortestNoteDuration
    }: {
        elementId: string,
        genes: number[],
        timeSignature: [number, 1 | 2 | 4 | 8 | 16 ],
        shortestNoteDuration: 1 | 2 | 4 | 8 | 16
    }): void {
        const sequence = this.genomeConverter.convertGenesToPlayableSequence(genes)
        this.renderer.render({
            elementId,
            timeSignature,
            shortestNoteDuration,
            sequence
        })
    }
}

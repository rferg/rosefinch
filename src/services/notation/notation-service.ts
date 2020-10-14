import { Injectable } from 'cewdi'
import { GenomeConverterService } from '../genome-converter-service'
import { DenominatedNote } from './denominated-note'
import { MeasureSplitter } from './measure-splitter'

@Injectable()
export class NotationService {
    constructor(
        private readonly genomeConverter: GenomeConverterService,
        private readonly splitter: MeasureSplitter) { }

    splitMeasures({
        genes,
        timeSignature,
        shortestNoteDuration
    }: {
        element: HTMLElement,
        genes: number[],
        timeSignature: [number, 1 | 2 | 4 | 8 | 16 ],
        shortestNoteDuration: 1 | 2 | 4 | 8 | 16
    }): DenominatedNote[][] {
        const sequence = this.genomeConverter.convertGenesToPlayableSequence(genes)
        return this.splitter.splitMeasures({
            timeSignature,
            shortestNoteDuration,
            sequence
        })
    }
}

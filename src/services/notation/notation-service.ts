import { Injectable } from 'cewdi'
import { svg, SVGTemplateResult } from 'lit-element'
import { GenomeConverterService } from '../genome-converter-service'
import { DenominatedNote } from './denominated-note'
import { MeasureSplitter } from './measure-splitter'
import { bassClef } from './svg/bass-clef.svg'
import { trebleClef } from './svg/treble-clef.svg'

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

    getStaffTemplate({
        x,
        y,
        width,
        height,
        clef,
        id,
        padding
    }: {
        x: number,
        y: number,
        width: number,
        height: number,
        clef: 'treble' | 'bass',
        id: string,
        padding: number
    }): SVGTemplateResult {
        const startX = x
        const startY = y + padding
        const strokeWidth = 0.5
        const spaceBetweenLines = (height - (2 * padding) - (strokeWidth * 4)) / 3
        return svg`
            <defs>
                <line id="staffLine"
                    x1=${startX}
                    y1=${startY}
                    x2=${startX + width}
                    y2=${startY}
                    stroke-width=${strokeWidth}></line>
                ${clef === 'bass' ? bassClef : trebleClef}
            </defs>
            <g id="${id}">
                <use href="#staffLine" y=${startY}></use>
                <use href="#staffLine" y=${startY + spaceBetweenLines}></use>
                <use href="#staffLine" y=${startY + spaceBetweenLines * 2}></use>
                <use href="#staffLine" y=${startY + spaceBetweenLines * 3}></use>
                <use href="#${clef === 'bass' ? 'bassClef' : 'trebleClef'}"
                    x=${x}
                    y=${y + 10}
                    height=${height}
                    width=${width / 10}></use>
            </g>
        `
    }
}

import { Injectable } from 'cewdi'
import abcjs from 'abcjs'
import { GenomeConverterService } from '../genome-converter-service'
import { DenominatedNote } from './denominated-note'
import { MeasureSplitter } from './measure-splitter'
import { Pitch } from '../../common/pitch'
import { GeneUtil } from '../../common/gene-util'
import { SerializedGeneticAlgorithmOptions } from '../../genetic-algorithm'
import { DurationDenomination } from '../../common/duration-denomination'
@Injectable()
export class NotationService {
    private readonly referenceOctave = 4
    private readonly decrementOctaveSymbol = `,`
    private readonly incrementOctaveSymbol = `'`

    constructor(
        private readonly genomeConverter: GenomeConverterService,
        private readonly splitter: MeasureSplitter) { }

    drawNotes({
        genome,
        options: { timeSignature, shortestNoteDuration },
        element
    }: {
        genome: number[],
        options: SerializedGeneticAlgorithmOptions,
        element: HTMLElement
    }): void {
        if (!element) {
            throw new Error(`Attempted to draw notes by HTMLElement was ${element}`)
        }

        const measures = this.splitMeasures({ genes: genome, timeSignature, shortestNoteDuration })
        const measureStrings: string[] = []
        for (let measureIndex = 0; measureIndex < measures.length; measureIndex++) {
            const measure = measures[measureIndex]
            let measureString = measure.map(note => this.getNoteString(note)).join('')
            if (this.measureNeedsTie(measures, measureIndex)) {
                measureString += '-'
            }
            measureStrings.push(measureString)
        }

        const abcString = `${this.getAbcStringHeader(timeSignature)}${measureStrings.join('|')}`

        abcjs.renderAbc(
            element,
            abcString,
            { add_classes: true, responsive: 'resize' })
    }

    private splitMeasures({
        genes,
        timeSignature,
        shortestNoteDuration
    }: {
        genes: number[],
        timeSignature: [number, DurationDenomination ],
        shortestNoteDuration: DurationDenomination
    }): DenominatedNote[][] {
        const sequence = this.genomeConverter.convertGenesToPlayableSequence(genes)
        return this.splitter.splitMeasures({
            timeSignature,
            shortestNoteDuration,
            sequence
        })
    }

    private isRest(pitch: Pitch): boolean {
        return GeneUtil.getPitch(pitch) === Pitch.Rest
    }

    private getAbcStringHeader(
        [ meterTop, meterBottom ]: [number, DurationDenomination]): string {
        return `M:${meterTop}/${meterBottom}\nL:1/16\nK:C\n`
    }

    private getNoteString({ pitch, octave, duration }: DenominatedNote): string {
        if (this.isRest(pitch)) {
            return `z${duration}`
        }

        let pitchString = Pitch[pitch]
        if (pitchString.endsWith('b')) {
            pitchString = `_${pitchString.substr(0, 1)}`
        }

        const octaveDifference = octave - this.referenceOctave
        const octaveString = (octaveDifference > 0 ? this.incrementOctaveSymbol : this.decrementOctaveSymbol)
            .repeat(Math.abs(octaveDifference))

        return `${pitchString}${octaveString}${duration}`
    }

    private measureNeedsTie(measures: DenominatedNote[][], measureIndex: number): boolean {
        if (measureIndex < measures.length - 1) {
            const measure = measures[measureIndex]
            const nextMeasure = measures[measureIndex + 1]
            if (measure.length && nextMeasure.length) {
                const lastNoteOfThisMeasure = measure[measure.length - 1]
                const firstNoteOfNextMeasure = nextMeasure[0]
                return lastNoteOfThisMeasure.originalNoteIndex === firstNoteOfNextMeasure.originalNoteIndex
            }
        }
        return false
    }
}

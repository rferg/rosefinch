import { Injectable } from 'cewdi'
import { GenomeConverterService } from '../genome-converter-service'
import { DenominatedNote } from './denominated-note'
import { MeasureSplitter } from './measure-splitter'
import { Pitch } from '../../common/pitch'
import { GeneUtil } from '../../common/gene-util'
import { SerializedGeneticAlgorithmOptions } from '../../genetic-algorithm'
import { DurationDenomination } from '../../common/duration-denomination'
import { Uint8 } from '../../common/uint8'
import { AbcNotationRenderer } from './abc-notation-renderer'
@Injectable()
export class NotationService {
    private readonly referenceOctave = 4
    private readonly decrementOctaveSymbol = `,`
    private readonly incrementOctaveSymbol = `'`

    constructor(
        private readonly genomeConverter: GenomeConverterService,
        private readonly splitter: MeasureSplitter,
        private readonly abcRenderer: AbcNotationRenderer) { }

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
        const medianOctave = this.getMedianOctave(genome)
        const abcString = `${this.getAbcStringHeader(medianOctave, timeSignature)}${measureStrings.join('|')}`

        this.abcRenderer.render(
            element,
            abcString,
            { add_classes: true, responsive: 'resize' })
    }

    private getMedianOctave(genome: number[]) {
        if (!(genome && genome.length)) {
            return 0
        }
        const sortedOctaves = [ ...genome ]
            .map(pitch => GeneUtil.getOctave(pitch as Uint8))
            .sort((a, b) => a - b)
        const midPoint = Math.floor(sortedOctaves.length / 2)
        if (midPoint % 2) {
            return sortedOctaves[midPoint]
        }
        return (sortedOctaves[midPoint - 1] + sortedOctaves[midPoint]) / 2.0
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
        medianOctave: number,
        [ meterTop, meterBottom ]: [number, DurationDenomination]): string {
            const clef = this.inferClefFromMedianOctave(medianOctave)
            return `M:${meterTop}/${meterBottom}\nL:1/16\nK:C clef=${clef}\n`
    }

    private getNoteString({ pitch, octave, durationInSixteenths: duration }: DenominatedNote): string {
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

    private inferClefFromMedianOctave(medianOctave: number): 'treble' | 'bass' {
        if (medianOctave < 3.5) {
            return 'bass'
        }
        return 'treble'
    }
}

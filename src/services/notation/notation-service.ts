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
import { AbcClickListener } from 'abcjs'

type GeneClickListener = (note: DenominatedNote) => void
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
        element,
        clickListener
    }: {
        genome: number[] | number[][],
        options: SerializedGeneticAlgorithmOptions,
        element: HTMLElement,
        clickListener?: GeneClickListener
    }): void {
        if (!element) {
            throw new Error(`Attempted to draw notes by HTMLElement was ${element}`)
        }

        const chords = this.convertToChords(genome)
        const measures = this.splitMeasures({ chords: chords, timeSignature, shortestNoteDuration })
        const measureStrings: string[] = []
        for (let measureIndex = 0; measureIndex < measures.length; measureIndex++) {
            const measure = measures[measureIndex]
            let measureString = measure.map(note => this.getNoteString(note)).join('')
            if (this.measureNeedsTie(measures, measureIndex)) {
                measureString += '-'
            }
            measureStrings.push(measureString)
        }
        const medianOctave = this.getMedianOctave(chords)
        const abcString = `${this.getAbcStringHeader(medianOctave, timeSignature)}${measureStrings.join('|')}`

        this.abcRenderer.render(
            element,
            abcString,
            {
                add_classes: true,
                responsive: 'resize',
                clickListener: this.createClickListener(measures, clickListener)
            })
    }

    convertToChords(genome: number[] | number[][]): number[][] {
        return (genome as number[][]).map(geneOrChord => {
            if (Array.isArray(geneOrChord)) { return geneOrChord }
            return [ geneOrChord ]
        })
    }

    private getMedianOctave(chords: number[][]): number {
        if (!(chords && chords.length)) {
            return 0
        }
        const sortedOctaves = [ ...chords ]
            .reduce((prev, curr) => prev.concat(curr), [])
            .map(pitch => GeneUtil.getOctave(pitch as Uint8))
            .sort((a, b) => a - b)
        const midPoint = Math.floor(sortedOctaves.length / 2)
        if (midPoint % 2) {
            return sortedOctaves[midPoint]
        }
        return (sortedOctaves[midPoint - 1] + sortedOctaves[midPoint]) / 2.0
    }

    private splitMeasures({
        chords,
        timeSignature,
        shortestNoteDuration
    }: {
        chords: number[][],
        timeSignature: [number, DurationDenomination ],
        shortestNoteDuration: DurationDenomination
    }): DenominatedNote[][] {
        const sequence = this.genomeConverter.convertChordsToPlayableSequence(chords)
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

    private getNoteString({ pitches, octaves, durationInSixteenths: duration }: DenominatedNote): string {
        if (!pitches?.length) { return '' }

        if (this.isRest(pitches[0])) {
            return `z${duration}`
        }

        const noteStrings: string[] = pitches.map((pitch, i) => {
            let pitchString = Pitch[pitch]
            if (pitchString.endsWith('b')) {
                pitchString = `_${pitchString.substr(0, 1)}`
            }

            const octave = octaves[i]
            const octaveDifference = octave - this.referenceOctave
            const octaveString = (octaveDifference > 0 ? this.incrementOctaveSymbol : this.decrementOctaveSymbol)
                .repeat(Math.abs(octaveDifference))

            return `${pitchString}${octaveString}${duration}`
        })

        if (noteStrings.length === 1) { return noteStrings[0] }
        return `[${noteStrings.join('')}]`
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

    private createClickListener(
        measures: DenominatedNote[][],
        originalListener?: GeneClickListener): AbcClickListener | undefined {
        if (!originalListener) { return undefined }

        return (el, _tune, classes, _analysis, _drag) => {
            if (!(el?.el_type === 'note') || !classes) { return }

            const measureRegex = /abcjs-m(\d+)/
            const noteRegex = /abcjs-n(\d+)/
            let noteIndex: number | undefined
            let measureIndex: number | undefined
            classes.split(' ').forEach(classList => {
                const measureMatch = classList.match(measureRegex)
                if (measureMatch && measureIndex === undefined) {
                    measureIndex = Number.parseInt(measureMatch[1])
                }

                const noteMatch = classList.match(noteRegex)
                if (noteMatch && noteIndex === undefined) {
                    noteIndex = Number.parseInt(noteMatch[1])
                }
            })

            if (noteIndex !== undefined && measureIndex !== undefined) {
                const note = measures?.[measureIndex]?.[noteIndex]
                originalListener(note)
            }
        }
    }
}

import { Injectable } from 'cewdi'
import { svg, SVGTemplateResult } from 'lit-element'
import { GenomeConverterService } from '../genome-converter-service'
import { DenominatedNote } from './denominated-note'
import { NoteRenderingOptions } from './note-rendering-options'
import { MeasureSplitter } from './measure-splitter'
import { RenderedNote } from './rendered-note'
import { bassClef } from './svg/bass-clef.svg'
import { trebleClef } from './svg/treble-clef.svg'
import { Pitch } from '../../common/pitch'
import { GeneUtil } from '../../common/gene-util'
import { Uint8 } from '../../common/uint8'
import { NoteDrawer } from './note-drawer'

interface StaffLineReference {
    clef: 'treble' | 'bass'
    lineIndexOnStaff: number
}
@Injectable()
export class NotationService {
    private readonly noteLineReference: (StaffLineReference | undefined)[]
    private readonly defaultLineReference: StaffLineReference = { clef: 'treble', lineIndexOnStaff: 1 }
    private readonly linesPerStaff = 5

    constructor(
        private readonly genomeConverter: GenomeConverterService,
        private readonly splitter: MeasureSplitter,
        private readonly noteDrawer: NoteDrawer) {
            this.noteLineReference = this.generateNoteLines()
        }

    splitMeasures({
        genes,
        timeSignature,
        shortestNoteDuration
    }: {
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

    getStaffTemplateAndPositions({
        x,
        y,
        width,
        height,
        clef,
        id,
        padding,
        strokeWidth
    }: {
        x: number,
        y: number,
        width: number,
        height: number,
        clef: 'treble' | 'bass',
        id: string,
        padding: number,
        strokeWidth: number
    }): {
        template: SVGTemplateResult,
        lineYs: number[],
        notesStartX: number
     } {
        const startX = x
        const startY = y + padding
        const numberOfLines = this.linesPerStaff
        const spaceBetweenLines = (height - (2 * padding) - (strokeWidth * numberOfLines)) / (numberOfLines - 1)
        const lineYs = [ ...new Array(numberOfLines) ].map((_, i) => startY + (spaceBetweenLines * i))
        const clefWidth = width / 10
        const notesStartX = x + clefWidth + 1
        const template = svg`
            <defs>
                <line id="staffLine"
                    x1=${startX}
                    y1=${0}
                    x2=${startX + width}
                    y2=${0}
                    stroke-width=${strokeWidth}></line>
                ${clef === 'bass' ? bassClef : trebleClef}
            </defs>
            <g id="${id}">
                ${lineYs.map(lineY => svg`<use href="#staffLine" y=${lineY}></use>`)}
                <use href="#${clef === 'bass' ? 'bassClef' : 'trebleClef'}"
                    x=${x}
                    y=${y}
                    height=${height}
                    width=${clefWidth}></use>
            </g>
        `
        return { template, lineYs, notesStartX }
    }

    renderNote({
        note,
        startX,
        trebleLineYs,
        bassLineYs,
        noteClass
    }: NoteRenderingOptions): RenderedNote {
        const bassYs = [ ...bassLineYs ].sort((a, b) => b - a)
        const trebleYs = [ ...trebleLineYs ].sort((a, b) => b - a)
        const spaceBetweenStaffLines = this.calculateDistanceBetweenLines(bassYs, trebleYs)
        const centerY = this.calculateNoteY(
            note.pitch,
            note.octave,
            trebleYs,
            bassYs,
            spaceBetweenStaffLines)
        const accidentalWidth = spaceBetweenStaffLines
        const centerX = startX + accidentalWidth
        const { template: noteTemplate, width: noteWidth } = this.noteDrawer.drawNote({
            centerX,
            centerY,
            spaceBetweenStaffLines: spaceBetweenStaffLines,
            duration: note.duration,
            stemDirection: 'up'
        })
        // TODO: RESTS, ACCIDENTALS, TIES, LEDGER LINES, BEAMS
        return {
            template: svg`<g class="${noteClass}">${noteTemplate}</g>`,
            endX: startX + noteWidth + accidentalWidth,
            originalNoteIndex: note.originalNoteIndex
        }
    }

    private calculateNoteY(
        pitch: Pitch,
        octave: number,
        trebleLineYs: number[],
        bassLineYs: number[],
        spaceBetweenLines: number): number {
            const note = GeneUtil.convertToGene(pitch, octave)
            const { clef, lineIndexOnStaff } = this.noteLineReference[note] || this.defaultLineReference
            const clefLineYs = clef === 'treble' ? trebleLineYs : bassLineYs
            const roundedLineIndex = Math.floor(lineIndexOnStaff)
            let lineY = 0
            if (roundedLineIndex < 0) {
                lineY = clefLineYs[0] - (roundedLineIndex * spaceBetweenLines)
            } else if (roundedLineIndex > clefLineYs.length - 1) {
                lineY = clefLineYs[clefLineYs.length - 1]
                    + ((roundedLineIndex - (clefLineYs.length - 1)) * spaceBetweenLines)
            } else {
                lineY = clefLineYs[roundedLineIndex]
            }
            return lineY - (roundedLineIndex !== lineIndexOnStaff ? spaceBetweenLines : 0)
    }

    private generateNoteLines(): StaffLineReference[] {
        const numPitches = GeneUtil.MAX_NOTE_VALUE + 1
        const result = new Array<StaffLineReference>(numPitches)
        const lastBassLine = this.linesPerStaff - 0.5 // right above top line (B4)
        const firstTrebleLine = -1 // C4
        // C0 will be on a line.
        let currentStaffLine = -9
        let currentClef: 'bass' | 'treble' = 'bass'
        for (let note = 0; note < numPitches; note++) {
            const pitch = GeneUtil.getPitch(note as Uint8)
            if (pitch === Pitch.Rest || pitch === Pitch.Hold) {
                result[note] = this.defaultLineReference
            } else {
                result[note] = {
                    clef: currentClef,
                    lineIndexOnStaff: currentStaffLine
                }

                if (!this.hasAccidental(pitch)) {
                    currentStaffLine += 0.5
                    if (currentStaffLine > lastBassLine && currentClef === 'bass') {
                        currentClef = 'treble'
                        currentStaffLine = firstTrebleLine
                    }
                }
            }
        }
        return result
    }

    private hasAccidental(pitch: Pitch): boolean {
        return Pitch[pitch].endsWith('b')
    }

    private calculateDistanceBetweenLines(bassLineYs: number[], trebleLineYs: number[]): number {
        const bassAvg = bassLineYs.reduce((prev, curr, i) =>
            prev + (i ? bassLineYs[i - 1] - curr : 0), 0) / bassLineYs.length - 1
        const trebleAvg = trebleLineYs.reduce((prev, curr, i) =>
            prev + (i ? trebleLineYs[i - 1] - curr : 0), 0) / trebleLineYs.length - 1
        const avg = (bassAvg + trebleAvg) / 2
        return avg
    }
}

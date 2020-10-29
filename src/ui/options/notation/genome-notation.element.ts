import { Injectable } from 'cewdi'
import { css, internalProperty, property, svg, SVGTemplateResult } from 'lit-element'
import { SerializedGeneticAlgorithmOptions } from '../../../genetic-algorithm'
import { NotationService, RenderedNote } from '../../../services/notation'
import { animationsStyles } from '../../common/animations.styles'
import { BaseElement } from '../../core/base-element'

@Injectable()
export class GenomeNotationElement extends BaseElement {
    static get styles() {
        return [
            super.styles,
            animationsStyles,
            css`
                :host {
                    --notation-background-color: var(--container-background-color);
                    background-color: var(--notation-background-color);
                }
                svg {
                    stroke: var(--danger-color);
                    fill: var(--danger-color);
                    height: 250px;
                    width: 100%;
                }
                svg .note {
                    stroke: var(--primary-color);
                    fill: var(--primary-color);
                    animation: fadeIn var(--animation-duration) var(--easing);
                }
                svg .negative-space {
                    fill: var(--notation-background-color);
                }
            `
        ]
    }

    private _options?: SerializedGeneticAlgorithmOptions
    @property()
    get options(): SerializedGeneticAlgorithmOptions | undefined {
        return this._options
    }
    set options(newVal: SerializedGeneticAlgorithmOptions | undefined) {
        if (newVal !== this._options) {
            const oldVal = this._options
            this._options = newVal
            // tslint:disable-next-line: no-floating-promises
            this.requestUpdate('options', oldVal)

            if (!this.staffIsInitialized) {
                this.initializeStaff()
            }

            if (this.genome.length && this._options) {
                this.drawNotes(this.genome, this._options)
            }
        }
    }

    private _genome?: number[]
    @property()
    get genome(): number[] {
        return this._genome || []
    }
    set genome(newVal: number[]) {
        if (newVal !== this._genome) {
            const oldVal = this._genome
            this._genome = newVal
            // tslint:disable-next-line: no-floating-promises
            this.requestUpdate('genome', oldVal)

            if (!this.staffIsInitialized) {
                this.initializeStaff()
            }

            if (this.genome && this.options) {
                this.drawNotes(this.genome, this.options)
            }
        }
    }

    @internalProperty()
    private trebleStaffTemplate?: SVGTemplateResult

    @internalProperty()
    private bassStaffTemplate?: SVGTemplateResult

    @internalProperty()
    private noteTemplates: SVGTemplateResult[] = []

    private staffIsInitialized = false
    private notesStartX = 0
    private trebleLineYs: number[] = []
    private bassLineYs: number[] = []

    private readonly staffPadding = 10
    private readonly staffHeight = 40
    private readonly staffWidth = 400
    private readonly strokeWidth = 0.75
    private readonly minSpaceBetweenNotes = 4

    constructor(private readonly service: NotationService) {
        super()
    }

    render() {
        return svg`
            <svg viewBox="0 0 ${this.staffWidth} 100" xmlns="http://www.w3.org/2000/svg">
                ${this.trebleStaffTemplate}
                ${this.bassStaffTemplate}
                ${this.noteTemplates.map(template => template)}
            </svg>
        `
    }

    private initializeStaff() {
        const { template, lineYs, notesStartX } = this.service.getStaffTemplateAndPositions({
            x: 0,
            y: 0,
            width: this.staffWidth,
            height: this.staffHeight,
            padding: this.staffPadding,
            clef: 'treble',
            id: 'trebleStaff',
            strokeWidth: this.strokeWidth
        })
        this.trebleStaffTemplate = template
        this.trebleLineYs = lineYs
        this.notesStartX = notesStartX

        const { template: bassTemplate, lineYs: bassLineYs } = this.service.getStaffTemplateAndPositions({
            x: 0,
            y: this.staffHeight,
            width: this.staffWidth,
            height: this.staffHeight,
            padding: this.staffPadding,
            clef: 'bass',
            id: 'bassStaff',
            strokeWidth: this.strokeWidth
        })
        this.bassStaffTemplate = bassTemplate
        this.bassLineYs = bassLineYs

        this.staffIsInitialized = true
    }

    private drawNotes(genome: number[], options: SerializedGeneticAlgorithmOptions) {
        // TODO
        const renderedNotes: RenderedNote[] = []
        let currentNoteIndex = 0
        let startX = this.notesStartX
        this.service.splitMeasures({
            genes: genome,
            timeSignature: options.timeSignature,
            shortestNoteDuration: options.shortestNoteDuration
        }).forEach((measure) => {
            // TEMPORARY
            // TODO:    CALCULATE WIDTH AND MAKE SURE MEASURE CAN FIT ON LINE, O.W. ADD STAFF
            //          AND UPDATE STAFF LINE Ys and notesStartX
            // TODO:    SPACE THAT NOTE TAKES UP SHOULD BE PROPORTIONAL TO ITS DURATION,
            //          E.G., WHOLE NOTE SHOULD TAKE UP SPACE OF 4 QUARTER NOTES
            measure.forEach((note) => {
                const renderedNote = this.service.renderNote({
                    note,
                    previousNote: renderedNotes[currentNoteIndex - 1],
                    trebleLineYs: this.trebleLineYs,
                    bassLineYs: this.bassLineYs,
                    startX,
                    noteClass: `note note${note.originalNoteIndex}`
                })
                currentNoteIndex++
                startX = (renderedNote.endX + this.minSpaceBetweenNotes)
                renderedNotes.push(renderedNote)
            })

            // TODO: DRAW MEASURE BAR
        })

        this.noteTemplates = renderedNotes.map(({ template }) => template)
    }
}

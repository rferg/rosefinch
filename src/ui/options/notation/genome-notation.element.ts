import { Injectable } from 'cewdi'
import { css, html, property, query } from 'lit-element'
import { SerializedGeneticAlgorithmOptions } from '../../../genetic-algorithm'
import { DenominatedNote, NotationService } from '../../../services/notation'
import { animationsStyles } from '../../common/animations.styles'
import { BaseElement } from '../../core/base-element'

type NoteSequence = number[] | number[][]
@Injectable()
export class GenomeNotationElement extends BaseElement {
    static get styles() {
        return [
            super.styles,
            animationsStyles,
            css`
                .notes-container {
                    display: flex;
                    width: 100%;
                    max-width: 900px;
                    justify-content: center;
                    align-items: center;
                    overflow-x: auto;
                }
                .abcjs-note, .abcjs-beam-elem, .abcjs-rest, .abcjs-slur {
                    fill: var(--primary-color);
                    animation: fadeIn var(--animation-duration) var(--easing);
                }
                .abcjs-staff, .abcjs-staff-extra, .abcjs-bar {
                    fill: var(--danger-color);
                    animation: fadeIn var(--animation-duration) var(--easing);
                }
                :host([clickable]) .abcjs-note + rect, :host([clickable]) .abcjs-rest + rect {
                    cursor: pointer;
                }
                :host([clickable]) .abcjs-note_selected {
                    fill: var(--success-color);
                    box-shadow: var(--focus-shadow);
                }
            `
        ]
    }

    @query('.notes-container > div')
    notesRenderContainer?: HTMLElement

    @property()
    clickListener?: (note: DenominatedNote) => void

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
            this.requestUpdate('options', oldVal).then(() => {
                if (this.genome && this.options) {
                    this.drawNotes(this.genome, this.options)
                }
            }).catch(err => console.error(err))

        }
    }

    private _genome?: NoteSequence
    @property()
    get genome(): NoteSequence {
        return this._genome || []
    }
    set genome(newVal: NoteSequence) {
        if (newVal !== this._genome) {
            const oldVal = this._genome
            this._genome = newVal
            this.requestUpdate('genome', oldVal).then(() => {
                if (this.genome && this.options) {
                    this.drawNotes(this.genome, this.options)
                }
            }).catch(err => console.error(err))
        }
    }

    constructor(private readonly service: NotationService) {
        super()
    }

    render() {
        return html`
            <div class="notes-container">
                <div></div>
            </div>`
    }

    private drawNotes(genome: NoteSequence, options: SerializedGeneticAlgorithmOptions) {
        if (this.notesRenderContainer) {
            this.service.drawNotes({
                genome,
                options,
                element: this.notesRenderContainer,
                clickListener: this.clickListener
            })
        }
    }
}

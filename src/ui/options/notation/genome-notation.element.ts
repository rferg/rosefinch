import { Injectable } from 'cewdi'
import { css, html, property, query } from 'lit-element'
import { SerializedGeneticAlgorithmOptions } from '../../../genetic-algorithm'
import { NotationService } from '../../../services/notation'
import { animationsStyles } from '../../common/animations.styles'
import { BaseElement } from '../../core/base-element'

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
                svg .abcjs-note, .abcjs-beam-elem, .abcjs-rest, .abcjs-slur {
                    fill: var(--primary-color);
                    animation: fadeIn var(--animation-duration) var(--easing);
                }
                svg .abcjs-staff, .abcjs-staff-extra, .abcjs-bar {
                    fill: var(--danger-color);
                    animation: fadeIn var(--animation-duration) var(--easing);
                }
            `
        ]
    }

    @query('.notes-container > div')
    notesRenderContainer?: HTMLElement

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

    private _genome?: number[]
    @property()
    get genome(): number[] {
        return this._genome || []
    }
    set genome(newVal: number[]) {
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

    private drawNotes(genome: number[], options: SerializedGeneticAlgorithmOptions) {
        if (this.notesRenderContainer) {
            this.service.drawNotes({ genome, options, element: this.notesRenderContainer })
        }
    }
}

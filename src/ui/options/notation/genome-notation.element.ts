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
            `
        ]
    }

    @query('#notes')
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
            this.requestUpdate('options', oldVal)

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

            if (this.genome && this.options) {
                this.drawNotes(this.genome, this.options)
            }
        }
    }

    constructor(private readonly service: NotationService) {
        super()
    }

    render() {
        return html`<div id="notes"></div>`
    }

    private drawNotes(genome: number[], options: SerializedGeneticAlgorithmOptions) {
        if (this.notesRenderContainer) {
            this.service.drawNotes({ genome, options, element: this.notesRenderContainer })
        }
    }
}

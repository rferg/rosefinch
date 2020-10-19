import { Injectable } from 'cewdi'
import { css, internalProperty, property, svg, SVGTemplateResult } from 'lit-element'
import { NotationService } from '../../../services/notation'
import { BaseElement } from '../../core/base-element'

@Injectable()
export class GenomeNotationElement extends BaseElement {
    static get styles() {
        return [
            super.styles,
            css`
                svg {
                    stroke: var(--danger-color);
                    fill: var(--danger-color);
                    height: 250px;
                    width: 100%;
                }
            `
        ]
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
        }
    }

    @internalProperty()
    private trebleStaffTemplate?: SVGTemplateResult

    @internalProperty()
    private bassStaffTemplate?: SVGTemplateResult

    private staffIsInitialized = false
    private notesStartX = 0
    private trebleLineYs: number[] = []
    private bassLineYs: number[] = []

    private readonly staffPadding = 10
    private readonly staffHeight = 40
    private readonly staffWidth = 100
    private readonly strokeWidth = 0.5

    constructor(private readonly service: NotationService) {
        super()
    }

    render() {
        return svg`
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                ${this.trebleStaffTemplate}
                ${this.bassStaffTemplate}
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
}

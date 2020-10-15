import { Injectable } from 'cewdi'
import { css, property, svg } from 'lit-element'
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

    @property()
    genome: number[] = []

    constructor(private readonly service: NotationService) {
        super()
    }

    render() {
        return svg`
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                ${this.service.getStaffTemplate({
                    x: 0,
                    y: 0,
                    width: 100,
                    height: 50,
                    padding: 10,
                    clef: 'bass',
                    id: 'trebleStaff'
                })}
            </svg>
        `
    }
}

import { Injectable } from 'cewdi'
import { css, html, property } from 'lit-element'
import { SerializedGeneticAlgorithmOptions } from '../../genetic-algorithm'
import { BaseElement } from '../core/base-element'

@Injectable()
export class RepresentativesFitnessFormElement extends BaseElement {
    static get styles() {
        return [
            super.styles,
            css``
        ]
    }

    @property({ reflect: false })
    options?: SerializedGeneticAlgorithmOptions

    // TODO

    render() {
        return html`<fitness-form></fitness-form>`
    }
}

import { Injectable } from 'cewdi'
import { css, property } from 'lit-element'
import { SerializedGeneticAlgorithmOptions } from '../../genetic-algorithm'
import { BaseElement } from '../core/base-element'

@Injectable()
export class RepresentativesHeaderElement extends BaseElement {
    static get styles() {
        return [
            super.styles,
            css``
        ]
    }

    @property({ reflect: false })
    options?: SerializedGeneticAlgorithmOptions

    // TODO
}

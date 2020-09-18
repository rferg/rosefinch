import { html } from '@open-wc/testing-helpers'
import { Injectable } from 'cewdi'
import { css, property } from 'lit-element'
import { SerializedGeneticAlgorithmOptions } from '../../genetic-algorithm'
import { headingsStyles } from '../common/headings.styles'
import { BaseElement } from '../core/base-element'

@Injectable()
export class RepresentativesHeaderElement extends BaseElement {
    static get styles() {
        return [
            super.styles,
            headingsStyles,
            css``
        ]
    }

    @property({ reflect: false })
    options?: SerializedGeneticAlgorithmOptions

    @property()
    generation?: number

    render() {
        return (this.generation && this.options)
            ? html`<rf-container><h1>Generation ${this.generation}</h1></rf-container>`
            : html``
    }
    // TODO
}

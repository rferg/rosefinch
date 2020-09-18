import { html } from '@open-wc/testing-helpers'
import { Injectable } from 'cewdi'
import { css, property } from 'lit-element'
import { BaseElement } from '../core/base-element'

@Injectable()
export class RepresentativeElement extends BaseElement {
    static get styles() {
        return [
            super.styles,
            css``
        ]
    }

    @property({ reflect: false })
    genome?: number[]

    @property({ reflect: true, type: Number })
    rating = 0

    render() {
        return html``
    }

    // TODO
}

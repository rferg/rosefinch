import { Injectable } from 'cewdi'
import { css, property } from 'lit-element'
import { BaseElement } from '../core/base-element'

@Injectable()
export class EditRepresentativeElement extends BaseElement {
    static get styles() {
        return [
            super.styles,
            css``
        ]
    }

    @property({ reflect: false })
    genome?: number[]

    // TODO
}

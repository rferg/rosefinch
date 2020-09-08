import { BaseElement } from '../../src/ui/core/base-element'
import { property } from 'lit-element'

export class TooltipElementStub extends BaseElement {
    static get is() { return 'rf-tooltip' }

    @property()
    text = ''

    @property({ reflect: true, type: Boolean })
    show = false
}

import { property } from 'lit-element'
import { BaseElement } from '../../src/ui/core/base-element'

export class PopupElementStub extends BaseElement {
    static get is() { return 'rf-popup' }

    @property({ reflect: true, type: Boolean })
    show = false
}

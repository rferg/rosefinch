import { BaseElement } from '../../src/ui/core/base-element'
import { property } from 'lit-element'

export class ButtonElementStub extends BaseElement {
    static get is() { return 'rf-button' }

    @property()
    buttonRole: 'primary' | 'success' | 'danger' = 'primary'

    @property({ type: Boolean })
    disabled = false
}

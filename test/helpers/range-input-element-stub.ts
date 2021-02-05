import { property } from 'lit-element'
import { BaseElement } from '../../src/ui/core/base-element'

export class RangeInputElementStub extends BaseElement {
    static get is() { return 'rf-range-input' }

    @property()
    min = 0

    @property()
    max = 100

    @property()
    value?: number

    @property()
    step = 1

    @property({ reflect: true, type: Boolean })
    disabled = false
}

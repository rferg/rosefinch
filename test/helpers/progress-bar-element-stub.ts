import { property } from 'lit-element'
import { BaseElement } from '../../src/ui/core/base-element'

export class ProgressBarElementStub extends BaseElement {
    static get is() { return 'rf-progress-bar' }

    @property({ reflect: true, type: Number })
    percentage = 0
}

import { BaseElement } from '../../src/ui/core/base-element'
import { html } from 'lit-element'

export class InsideContainerElementStub extends BaseElement {
    static get is() { return 'rf-inside-container' }

    render() { return html`<slot></slot>` }
}

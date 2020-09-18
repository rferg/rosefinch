import { html } from '@open-wc/testing-helpers'
import { BaseElement } from '../../src/ui/core/base-element'

export class ContainerElementStub extends BaseElement {
    static get is() { return 'rf-container' }

    render() { return html`<slot></slot>` }
}

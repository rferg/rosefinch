import { Injectable } from 'cewdi'
import { html } from 'lit-element'
import { BaseElement } from '../core/base-element'

@Injectable()
export class PipelineElement extends BaseElement {
    render() {
        return html`<h1>Hello Pipeline</h1>`
    }
}

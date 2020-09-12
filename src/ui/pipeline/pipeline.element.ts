import { Injectable } from 'cewdi'
import { css, html } from 'lit-element'
import { animationsStyles } from '../common/animations.styles'
import { headingsStyles } from '../common/headings.styles'
import { BaseElement } from '../core/base-element'

@Injectable()
export class PipelineElement extends BaseElement {
    static get styles() {
        return [
            super.styles,
            headingsStyles,
            animationsStyles,
            css``
        ]
    }

    render() {
        return html`<h1>Hello Pipeline</h1>`
    }
}

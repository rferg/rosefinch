import { BaseElement } from './base-element'
import { css, html } from 'lit-element'
import { Injectable } from 'cewdi'

@Injectable()
export class FourOhFourElement extends BaseElement {

    static get styles() {
        return css`
            h1 { font-weight: var(--bold-weight); }
        `
    }

    render() {
        return html`<h1>404</h1><p>Turn back. Nothing at this route.</p>`
    }
}

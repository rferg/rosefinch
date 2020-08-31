import { css, customElement, html } from 'lit-element'
import { BaseElement } from '../core/base-element'

@customElement('rf-inside-container')
export class InsideContainerElement extends BaseElement {
    static get styles() {
        return css`
            :host {
                padding: var(--small-padding);
                display: flex;
                flex-direction: row;
                justify-content: center;
                align-items: center;
                box-shadow: var(--secondary-shadow);
                border-radius: var(--border-radius);
                background-color: var(--container-background-color);
                margin: var(--padding);
                width: 100%;
            }
        `
    }

    render() {
        return html`<slot></slot>`
    }
}

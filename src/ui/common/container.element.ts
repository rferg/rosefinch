import { css, customElement, html } from 'lit-element'
import { BaseElement } from '../core/base-element'

@customElement('rf-container')
export class ContainerElement extends BaseElement {
    static get styles() {
        return css`
            :host {
                padding: var(--padding);
                display: flex;
                flex-direction: column;
                justify-content: flex-start;
                align-items: center;
                box-shadow: var(--primary-shadow);
                border-radius: var(--border-radius);
                background-color: var(--container-background-color);
                margin: var(--padding);
            }
        `
    }

    render() {
        return html`<slot></slot>`
    }
}

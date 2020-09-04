import { css, html } from 'lit-element'
import { BaseElement } from '../core/base-element'

export class InsideContainerElement extends BaseElement {
    static get styles() {
        return [
            super.styles,
            css`
                :host {
                    padding: calc(var(--small-padding) / 2);
                    display: flex;
                    flex-flow: row wrap;
                    justify-content: center;
                    align-items: center;
                    box-shadow: var(--secondary-shadow);
                    border-radius: var(--border-radius);
                    background-color: var(--container-background-color);
                    margin: var(--small-padding);
                    width: 100%;
                }
            `
        ]
    }

    render() {
        return html`<slot></slot>`
    }
}

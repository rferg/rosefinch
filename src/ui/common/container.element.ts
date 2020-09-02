import { css, html } from 'lit-element'
import { BaseElement } from '../core/base-element'
import { animationsStyles } from './animations.styles'

export class ContainerElement extends BaseElement {
    static get styles() {
        return [
            super.styles,
            animationsStyles,
            css`
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
                    animation: fadeIn var(--animation-duration) var(--easing);
                }
            `
        ]
    }

    render() {
        return html`<slot></slot>`
    }
}

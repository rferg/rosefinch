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
                @media screen and (max-width: 768px) and (orientation: portrait),
                screen and (max-width: 1024px) and (orientation: landscape) {
                    :host {
                        margin-left: 0;
                        margin-right: 0;
                    }
                }
            `
        ]
    }

    render() {
        return html`<slot></slot>`
    }
}

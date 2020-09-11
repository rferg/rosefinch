import { BaseElement } from '../core/base-element'
import { css, html, property } from 'lit-element'
import { animationsStyles } from '../common/animations.styles'
import { Injectable } from 'cewdi'

@Injectable()
export class PopupElement extends BaseElement {
    static get styles() {
        return [
            super.styles,
            animationsStyles,
            css`
                :host {
                    position: fixed;
                    top: 0;
                    left: 0;
                    opacity: 0;
                    pointer-events: none;
                    width: 100%;
                    height: 100%;
                    background-color: var(--mask-color);
                    z-index: 3;
                }
                div {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background-color: var(--overlay-color);
                    border-radius: var(--border-radius);
                    padding: var(--padding);
                    box-shadow: var(--primary-shadow);
                    display: flex;
                    flex-flow: column nowrap;
                    align-items: center;
                    justify-content: center;
                    width: auto;
                    max-width: 75vw;
                }
                @media screen and (max-width: 768px) and (orientation: portrait),
                screen and (max-width: 1024px) and (orientation: landscape) {
                    div {
                        max-width: 100vw;
                    }
                }
                :host([show]) {
                    opacity: 1;
                    pointer-events: auto;
                    animation: fadeIn var(--animation-duration) var(--easing);
                }
            `
        ]
    }

    @property({ reflect: true, type: Boolean })
    show = false

    render() {
        return html`<div><slot></slot></div>`
    }
}

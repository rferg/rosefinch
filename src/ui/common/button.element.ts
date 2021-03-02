import { BaseElement } from '../core/base-element'
import { css, html, property } from 'lit-element'
import { Injectable } from 'cewdi'

@Injectable()
export class ButtonElement extends BaseElement {
    static get styles() {
        return [
            super.styles,
            css`
                :host([buttonRole="primary"]) button {
                    background-color: var(--primary-color);
                }
                :host([buttonRole="success"]) button {
                    background-color: var(--success-color);
                }
                :host([buttonRole="danger"]) button {
                    background-color: var(--danger-color);
                }
                :host([buttonRole="outline"]) button {
                    background-color: var(--container-background-color);
                    box-shadow: none;
                }
                :host([disabled]) button {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                button {
                    display: block;
                    text-align: center;
                    background-color: var(--primary-color);
                    cursor: pointer;
                    padding: var(--small-padding);
                    box-shadow: var(--secondary-shadow);
                    outline: none;
                    border: none;
                    transition: opacity var(--short-animation-duration) var(--easing);
                    white-space: nowrap;
                    font-weight: var(--bold-weight);
                    color: var(--inverse-font-color);
                    border-radius: var(--border-radius);
                    font-size: var(--font-size);
                }
                button:hover {
                    opacity: 0.8;
                }
                button:focus {
                    box-shadow: var(--focus-shadow);
                }
                :host([size="large"]) button {
                    padding: var(--padding);
                }
                :host([size="small"]) button {
                    padding: calc(var(--small-padding) / 4);
                }
            `
        ]
    }

    @property()
    buttonRole: 'primary' | 'success' | 'danger' | 'outline' = 'primary'

    @property({ type: Boolean })
    disabled = false

    @property({ type: String })
    size: 'large' | 'medium' | 'small' = 'medium'

    render() {
        return html`<button type="button" ?disabled=${this.disabled}><slot></slot></button>`
    }
}

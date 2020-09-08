import { BaseElement } from '../core/base-element'
import { animationsStyles } from './animations.styles'
import { css, html, property } from 'lit-element'

export class TooltipElement extends BaseElement {
    static get styles() {
        return [
            super.styles,
            animationsStyles,
            css`
                :host {
                    display: inline-block;
                    position: relative;
                }
                button {
                    height: 1.5rem;
                    width: 1.5rem;
                    font-size: var(--small-font-size);
                    border-radius: 50%;
                    border: none;
                    outline: none;
                    box-shadow: var(--secondary-shadow);
                    color: var(--inverse-font-color);
                    background-color: var(--primary-color);
                    text-align: center;
                    cursor: pointer;
                }
                button:hover {
                    opacity: 0.8;
                }
                div {
                    position: absolute;
                    top: 0;
                    left: 2rem;
                    background-color: var(--overlay-color);
                    padding: var(--small-padding);
                    border-radius: var(--border-radius);
                    box-shadow: var(--primary-shadow);
                    pointer-events: none;
                    opacity: 0;
                    transition: opacity var(--animation-duration) var(--easing);
                    font-size: var(--small-font-size);
                    color: var(--inverse-font-color);
                    line-height: calc(var(--line-height) / 1.25);
                    z-index: 1;
                    width: 250px;
                }
                :host([show]) div {
                    opacity: 1;
                    pointer-events: auto;
                }
            `
        ]
    }

    @property({ attribute: false })
    text = ''

    @property({ reflect: true, type: Boolean })
    show = false

    constructor() {
        super()

        this.onDocumentClick = this.onDocumentClick.bind(this)
        document.addEventListener('click', this.onDocumentClick)
    }

    disconnectedCallback() {
        document.removeEventListener('click', this.onDocumentClick)
    }

    render() {
        return html`
            <button title="Click to ${this.show ? 'hide' : 'show'} help message." @click=${this.toggleShow}>
            ?
            </button>
            <div>${this.text}</div>`
    }

    private toggleShow() {
        this.show = !this.show
    }

    private onDocumentClick(ev: MouseEvent) {
        if (this.show && this.clickIsOutside(ev)) {
            this.show = false
        }
    }

    private clickIsOutside(ev: MouseEvent): boolean {
        return !ev.composedPath()
            .filter(target => this.isNode(target))
            .some(target => this.contains(target as Node))
    }

    private isNode(x: any): x is Node {
        return !!(x as Node)?.nodeName
    }
}

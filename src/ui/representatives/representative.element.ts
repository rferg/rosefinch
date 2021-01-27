import { html } from '@open-wc/testing-helpers'
import { Injectable } from 'cewdi'
import { css, property } from 'lit-element'
import { BaseElement } from '../core/base-element'

@Injectable()
export class RepresentativeElement extends BaseElement {
    static get styles() {
        return [
            super.styles,
            css`
                :host {
                    width: 100%;
                    cursor: pointer;
                }
                rf-inside-container {
                   display: flex;
                   flex-flow: column nowrap;
                   align-items: center;
                   justify-content: center;
                   border: solid 0.25rem transparent;
                   cursor: pointer;
                   overflow-x: hidden;
                   transition: background-color var(--short-animation-duration) var(--easing);
                }
                rf-inside-container:hover {
                    background-color: var(--light-primary-color);
                }
                :host([active]) rf-inside-container {
                    background-color: var(--light-primary-color);
                    border-color: var(--primary-color);
                }
                ::slotted(*) {
                    margin: 0.25rem 0;
                    min-width: 20rem;
                }
            `
        ]
    }

    @property({ reflect: true, type: Number })
    rating = 0

    @property({ reflect: true, type: Boolean })
    active = false

    render() {
        return html`
            <rf-inside-container>
                <slot></slot>
                <rf-rating-display .rating=${this.rating}></rf-rating-display>
            </rf-inside-container>
        `
    }
}

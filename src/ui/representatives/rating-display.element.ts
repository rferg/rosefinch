import { Injectable } from 'cewdi'
import { css, html, property } from 'lit-element'
import { BaseElement } from '../core/base-element'

type Category = 'high' | 'mid' | 'low' | ''

@Injectable()
export class RatingDisplayElement extends BaseElement {
    static get styles() {
        return [
            super.styles,
            css`
                :host span {
                    display: block;
                    text-align: center;
                    background-color: var(--light-primary-color);
                    font-weight: var(--bold-weight);
                    font-size: var(--font-size);
                    box-shadow: var(--secondary-shadow);
                    padding: calc(var(--small-padding) * 0.5) var(--padding);
                    border-radius: var(--border-radius);
                    transition: background-color var(--animation-duration) var(--easing),
                        color var(--animation-duration) var(--easing);
                    border: none;
                    outline: none;
                }
                :host([category="high"]) span {
                    background-color: var(--success-color);
                    color: var(--inverse-font-color);
                }
                :host([category="mid"]) span {
                    background-color: var(--medium-primary-color);
                    color: var(--inverse-font-color);
                }
                :host([category="low"]) span {
                    background-color: var(--danger-color);
                    color: var(--inverse-font-color);
                }
            `
        ]
    }

    @property({ reflect: true, type: String })
    category: Category = ''

    private _rating?: number
    @property({ reflect: false })
    get rating(): number {
        return this._rating || 0
    }
    set rating(val: number) {
        if (val !== this._rating) {
            const olVal = this._rating
            this._rating = val
            // tslint:disable-next-line: no-floating-promises
            this.requestUpdate('rating', olVal)
            this.category = this.thresholds.find(({ threshold }) => this.rating >= threshold)?.category ?? ''
        }
    }

    private readonly thresholds: { threshold: number, category: Category }[] = [
        { threshold: 67, category: 'high' },
        { threshold: 34, category: 'mid' },
        { threshold: 1, category: 'low' },
        { threshold: 0, category: '' }
    ]

    render() {
        return html`<span>${this.rating || 'NR'}</span>`
    }
}

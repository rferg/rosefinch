import { Injectable } from 'cewdi'
import { css, html, property } from 'lit-element'
import { linkLikeButtonStyles } from '../common/link-like-button.styles'
import { ValueChangeEvent } from '../common/value-change-event'
import { BaseElement } from '../core/base-element'

@Injectable()
export class FitnessFormItemElement extends BaseElement {
    static get styles() {
        return [
            super.styles,
            linkLikeButtonStyles,
            css`
                rf-inside-container {
                    flex-flow: row wrap;
                    align-items: center;
                    justify-content: space-between;
                    padding-left: var(--padding);
                    padding-right: var(--padding);
                }
                button {
                    width: 100%;
                }
                button h5 {
                    margin: 0
                }
                rf-inside-container > * {
                    margin: var(--small-padding) 0;
                }
                div {
                    display: flex;
                    flex-flow: column nowrap;
                    justify-content: space-around;
                    margin-left: auto;
                }
                div span {
                    font-size: small;
                    text-align: center;
                }
                p {
                    flex-grow: 1;
                    margin-right: var(--small-padding);
                }
            `
        ]
    }

    @property({ type: Number })
    weight?: number

    @property({ type: String })
    itemTitle?: string

    @property({ type: String })
    valueText?: string

    render() {
        return html`
            <rf-inside-container>
                <button class="link-like-button" @click=${this.onEditClick} title="Edit">
                    <h5>${this.itemTitle || ''}</h5>
                </button>
                <p>${this.valueText || 'None selected'}</p>
                <div>
                    <span>Weight: ${this.weight || 0}</span>
                    <rf-range-input
                        .min=${0}
                        .max=${10}
                        .value=${this.weight}
                        .step=${0.1}
                        @value-change=${this.onWeightChange}></rf-range-input>
                </div>
            </rf-inside-container>
            `
    }

    private onEditClick(ev: Event) {
        ev.stopPropagation()
        this.dispatchEvent(new Event('edit'))
    }

    private onWeightChange(ev: ValueChangeEvent<number>) {
        ev.stopPropagation()
        this.dispatchEvent(new ValueChangeEvent<number>(ev.value))
    }
}

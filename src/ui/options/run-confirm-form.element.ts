import { Injectable } from 'cewdi'
import { css, html, internalProperty } from 'lit-element'
import { Icon } from '../common/icon'
import { BaseElement } from '../core/base-element'
import { cancelEventType } from './cancel-event-type'
import { FormSubmitEvent } from './form-submit-event'

@Injectable()
export class RunConfirmFormElement extends BaseElement {
    static get styles() {
        return [
            super.styles,
            css`
                :host {
                    display: flex;
                    flex-flow: column nowrap;
                    justify-content: space-around;
                    align-items: center;
                    font-weight: var(--bold-weight);
                    font-size: var(--font-size);
                    padding: var(--padding);
                    width: 100%;
                }
                p {
                    width: 100%;
                    color: var(--inverse-font-color);
                    margin: var(--padding) 0;
                    text-align: center;
                }
                input {
                    display: inline-block;
                    outline: none;
                    background-color: transparent;
                    padding: calc(var(--small-padding) / 2) var(--small-padding);
                    border: none;
                    border-bottom: 1px solid var(--inverse-font-color);
                    transition: background-color var(--short-animation-duration) var(--easing);
                    font-size: var(--font-size);
                    border-radius: var(--border-radius);
                    border-bottom-right-radius: 0;
                    border-bottom-left-radius: 0;
                    text-align: center;
                    width: auto;
                    text-overflow: ellipsis;
                    color: var(--inverse-font-color);
                    font-weight: var(--bold-weight);
                }
                input {
                    max-width: 5rem;
                }
                input[type=number]::-webkit-outer-spin-button,
                input[type=number]::-webkit-inner-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
                input[type=number] {
                    -moz-appearance: textfield;
                }
                input:focus, input:hover  {
                    background-color: var(--primary-color);
                }
                div {
                    width: 100%;
                    display: flex;
                    justify-content: space-evenly;
                    align-items: center;
                }
            `
        ]
    }

    @internalProperty()
    private value: { numberOfGenerations: number } = { numberOfGenerations: 25 }
    private readonly minGenerations = 1
    private readonly maxGenerations = 500

    render() {
        return html`
            <p>
                Run <input type="number"
                    max=${this.maxGenerations}
                    min=${this.minGenerations}
                    @input=${this.onChange}
                    .value=${this.value.numberOfGenerations.toLocaleString()} />
                     generation${this.value.numberOfGenerations > 1 ? html`s` : html``}?
            </p>
            <div>
                <rf-button title="Cancel" buttonRole="danger" @click=${this.onCancel}>
                    <rf-icon icon=${Icon.Cross}></rf-icon>
                </rf-button>
                <rf-button title="Confirm"
                    buttonRole="success" @click=${this.onConfirm}>
                    <rf-icon icon=${Icon.Check}></rf-icon>
                </rf-button>
            </div>
        `
    }

    private onChange(ev: Event) {
        let inputValue = Math.floor(Number.parseFloat((ev.target as HTMLInputElement)?.value || '0'))
        if (inputValue < this.minGenerations) {
            inputValue = this.minGenerations
        } else if (inputValue > this.maxGenerations) {
            inputValue = this.maxGenerations
        }
        this.value = { numberOfGenerations: inputValue }
    }

    private onCancel() {
        this.dispatchEvent(new CustomEvent(cancelEventType))
    }

    private onConfirm() {
        this.dispatchEvent(
            new FormSubmitEvent<{ numberOfGenerations: number }>({ value: this.value }))
    }
}

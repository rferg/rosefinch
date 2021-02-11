import { Injectable } from 'cewdi'
import { css, html, property } from 'lit-element'
import { RestProportionOptions } from '../../../genetic-algorithm'
import { ValueChangeEvent } from '../../common/value-change-event'
import { BaseElement } from '../../core/base-element'
import { FormSubmitEvent } from '../form-submit-event'

@Injectable()
export class RestProportionFitnessElement extends BaseElement {
    static get styles() {
        return [
            super.styles,
            css`
                :host {
                    width: 100%;
                    display: flex;
                    flex-flow: column nowrap;
                }
                :host > * {
                    width: 100%;
                }
                h5 {
                    text-align: center;
                }
                div.input-container {
                    display: flex;
                    flex-flow: column nowrap;
                    justify-content: flex-start;
                    align-items: center;
                    padding: var(--padding);
                }
                rf-range-input {
                    width: 100%;
                }
            `
        ]
    }

    @property()
    options?: RestProportionOptions

    render() {
        return html`
            <h5>Rest Proportion</h5>
            <div class="input-container">
                <span>${Math.floor((this.options?.targetProportion ?? 0) * 100)}%</span>
                <rf-range-input
                    .min=${0}
                    .max=${1}
                    .value=${this.options?.targetProportion}
                    .step=${0.05}
                    @value-change=${this.onProportionChange}>
                </rf-range-input>
            </div>
            <rf-fitness-form-item-buttons @cancel=${this.onCancel} @submit=${this.onSubmit}>
            </rf-fitness-form-item-buttons>
        `
    }

    private onProportionChange(ev: ValueChangeEvent<number>) {
        this.options = { ...this.options, targetProportion: ev.value || 0 }
    }

    private onCancel() {
        this.dispatchEvent(new CustomEvent('cancel', { bubbles: true, composed: true }))
    }

    private onSubmit() {
        if (this.options) {
            this.dispatchEvent(new FormSubmitEvent<RestProportionOptions>({ value: { ...this.options } }))
        }
    }
}

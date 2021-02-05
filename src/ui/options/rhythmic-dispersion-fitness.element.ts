import { Injectable } from 'cewdi'
import { css, html, property } from 'lit-element'
import { RhythmicDispersionOptions } from '../../genetic-algorithm'
import { ValueChangeEvent } from '../common/value-change-event'
import { BaseElement } from '../core/base-element'
import { FormSubmitEvent } from './form-submit-event'

@Injectable()
export class RhythmicDispersionFitnessElement extends BaseElement {
    static get styles() {
        return [
            super.styles,
            css`
                :host {
                    width: 100%;
                    display: flex;
                    flex-flow: column nowrap;
                    align-items: center;
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
    options?: RhythmicDispersionOptions

    @property()
    labels: { 0?: string, 1?: string, 2?: string } = {}

    render() {
        return html`
            <h5>Rhythmic Dispersion</h5>
            <div class="input-container">
                <span>${this.labels[this.options?.target ?? 0]}</span>
                <rf-range-input
                    .min=${0}
                    .max=${2}
                    .value=${this.options?.target}
                    .step=${1}
                    @value-change=${this.onTargetChange}>
                </rf-range-input>
            </div>
            <rf-fitness-form-item-buttons @cancel=${this.onCancel} @submit=${this.onSubmit}>
            </rf-fitness-form-item-buttons>
        `
    }

    private onTargetChange(ev: ValueChangeEvent<0 | 1 | 2>) {
        this.options = { ...this.options, target: ev.value || 0 }
    }

    private onCancel() {
        this.dispatchEvent(new CustomEvent('cancel', { bubbles: true, composed: true }))
    }

    private onSubmit() {
        if (this.options) {
            this.dispatchEvent(new FormSubmitEvent<RhythmicDispersionOptions>({ value: { ...this.options } }))
        }
    }
}

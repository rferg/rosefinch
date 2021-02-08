import { Injectable } from 'cewdi'
import { css, html, internalProperty, property } from 'lit-element'
import { PitchSequenceDirectionOptions } from '../../genetic-algorithm'
import { PitchSequenceType } from '../../genetic-algorithm/fitness/pitch-sequence-type'
import { ValueChangeEvent } from '../common/value-change-event'
import { BaseElement } from '../core/base-element'
import { FormSubmitEvent } from './form-submit-event'

@Injectable()
export class PitchSequenceDirectionFitnessElement extends BaseElement {
    static get styles() {
        return [
            super.styles,
            css`
                :host {
                    width: 100%;
                }
                h5 {
                    width: 100%;
                    text-align: center;
                    margin-bottom: 0;
                }
                .sequence-length-container {
                    display: flex;
                    width: 100%;
                    flex-flow: column nowrap;
                    align-items: center;
                    padding: var(--padding);
                }
                .sequence-length-container > rf-range-input {
                    width: 100%;
                }
                ul {
                    display: flex;
                    flex-flow: column nowrap;
                    justify-content: flex-start;
                    align-items: flex-start;
                    padding: var(--small-padding);
                    margin: 0;
                }
                ul.degrees-list {
                    flex-flow: column nowrap;
                    justify-content: flex-start;
                    align-items: flex-start;
                    max-height: 28vh;
                    overflow-y: auto;
                }
                ul li {
                    width: 100%;
                    display: flex;
                    flex-flow: row wrap;
                    justify-content: space-between;
                    align-items: center;
                    margin: var(--small-padding) 0;
                }
                ul li div {
                    display: flex;
                    flex-flow: column nowrap;
                    text-align: left;
                }
                ul li label {
                    font-size: var(--small-font-size);
                }
            `
        ]
    }

    @property()
    options?: PitchSequenceDirectionOptions

    @internalProperty()
    private readonly scoreKeys: { key: PitchSequenceType, label: string }[] = [
        { key: PitchSequenceType.Ascending, label: 'Ascending' },
        { key: PitchSequenceType.Descending, label: 'Descending' },
        { key: PitchSequenceType.Stable, label: 'Stable' }
    ]

    render() {
        return html`
            <h5>Sequence Length</h5>
            <div class="sequence-length-container">
                <label>${this.options?.sequenceLength ?? 0}</label>
                <rf-range-input
                    name="sequenceLength"
                    .min=${2}
                    .max=${5}
                    .value=${this.options?.sequenceLength}
                    .step=${1}
                    @value-change=${this.onSequenceLengthChange}>
                </rf-range-input>
            </div>
            <h5>Sequence Direction</h5>
            <ul>
                ${this.scoreKeys.map(({ key, label }) => {
                    return html`
                        <li>
                            <span>${label}</span>
                            <div>
                                <label>Score: ${this.options?.scores?.[key]}</label>
                                <rf-range-input
                                    name="${key}"
                                    .min=${0}
                                    .max=${10}
                                    .value=${this.options?.scores?.[key]}
                                    .step=${1}
                                    @value-change=${(ev: ValueChangeEvent<number>) => this.onScoreChange(key, ev)}>
                                    </rf-range-input>
                            </div>
                        </li>
                    `
                })}
            </ul>
            <rf-fitness-form-item-buttons @cancel=${this.onCancel} @submit=${this.onSubmit}>
            </rf-fitness-form-item-buttons>
        `
    }

    private onSequenceLengthChange(ev: ValueChangeEvent<number>) {
        ev.stopPropagation()
        if (!this.options) {
            this.options = { sequenceLength: 0, scores: { ascending: 1, descending: 1, stable: 1 } }
        }
        this.options = { ...this.options, sequenceLength: ev.value || 0 }
    }

    private onScoreChange(key: PitchSequenceType, ev: ValueChangeEvent<number>) {
        ev.stopPropagation()
        if (!this.options) {
            this.options = { sequenceLength: 0, scores: { ascending: 1, descending: 1, stable: 1 } }
        }
        this.options = { ...this.options, scores: { ...this.options.scores, [key]: ev.value } }
    }

    private onCancel() {
        this.dispatchEvent(new CustomEvent('cancel', { bubbles: true, composed: true }))
    }

    private onSubmit() {
        if (this.options) {
            this.dispatchEvent(new FormSubmitEvent<PitchSequenceDirectionOptions>({ value: { ...this.options } }))
        }
    }
}

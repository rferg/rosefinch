import { Injectable } from 'cewdi'
import { css, html, property } from 'lit-element'
import { PitchSequenceDirectionConfig, PitchSequenceType } from '../../../genetic-algorithm'
import { OptionsFormService } from '../../../services'
import { headingsStyles } from '../../common/headings.styles'
import { ValueChangeEvent } from '../../common/value-change-event'
import { BaseElement } from '../../core/base-element'
import { FormSubmitEvent } from '../form-submit-event'

@Injectable()
export class PitchSequenceDirectionFitnessElement extends BaseElement {
    static get styles() {
        return [
            super.styles,
            headingsStyles,
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
    config: PitchSequenceDirectionConfig

    private readonly scoreKeys: { key: PitchSequenceType, label: string }[] = [
        { key: PitchSequenceType.Ascending, label: 'Ascending' },
        { key: PitchSequenceType.Descending, label: 'Descending' },
        { key: PitchSequenceType.Stable, label: 'Stable' }
    ]

    constructor(private readonly formService: OptionsFormService) {
        super()

        this.config = this.formService.get('pitchSequence') as PitchSequenceDirectionConfig
        if (!this.config) {
            throw new Error('PitchSequenceDirectionConfig is undefined')
        }
    }

    render() {
        return html`
            <h5>Sequence Length</h5>
            <div class="sequence-length-container">
                <label>${this.config.options.sequenceLength}</label>
                <rf-range-input
                    name="sequenceLength"
                    .min=${2}
                    .max=${5}
                    .value=${this.config.options.sequenceLength}
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
                                <label>Score: ${this.config.options.scores?.[key]}</label>
                                <rf-range-input
                                    name="${key}"
                                    .min=${0}
                                    .max=${10}
                                    .value=${this.config.options.scores?.[key]}
                                    .step=${1}
                                    @value-change=${(ev: ValueChangeEvent<number>) => this.onScoreChange(key, ev)}>
                                    </rf-range-input>
                            </div>
                        </li>
                    `
                })}
            </ul>
        `
    }

    private onSequenceLengthChange(ev: ValueChangeEvent<number>) {
        ev.stopPropagation()
        this.config = {
            ...this.config,
            options: {
                ...this.config.options,
                sequenceLength: ev.value || 0
            }
        }
        this.submitChange()
    }

    private onScoreChange(key: PitchSequenceType, ev: ValueChangeEvent<number>) {
        ev.stopPropagation()
        this.config = {
            ...this.config,
            options: {
                ...this.config.options,
                scores: { ...this.config.options.scores, [key]: ev.value }
            }
        }
        this.submitChange()
    }

    private submitChange() {
        this.dispatchEvent(new FormSubmitEvent({
            value: {
                pitchSequence: { ...this.config }
            }
        }))
    }
}

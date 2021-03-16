import { Injectable } from 'cewdi'
import { css, html, property } from 'lit-element'
import { RhythmicDispersionConfig } from '../../../genetic-algorithm/fitness/rhythmic-dispersion-config'
import { OptionsFormService } from '../../../services'
import { headingsStyles } from '../../common/headings.styles'
import { ValueChangeEvent } from '../../common/value-change-event'
import { BaseElement } from '../../core/base-element'
import { FormSubmitEvent } from '../form-submit-event'

@Injectable()
export class RhythmicDispersionFitnessElement extends BaseElement {
    static get styles() {
        return [
            super.styles,
            headingsStyles,
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
    config: RhythmicDispersionConfig

    private readonly labels = {
        0: 'Constant - mostly the same note length',
        1: 'Balanced - variation in note lengths',
        2: 'Extreme - mostly very short and very long notes'
    }

    constructor(private readonly formService: OptionsFormService) {
        super()

        this.config = this.formService.get('rhythmicDispersion') as RhythmicDispersionConfig
        if (!this.config) {
            throw new Error('RhythmicDispersion config was undefined')
        }
    }

    render() {
        return html`
            <h5>Rhythmic Dispersion</h5>
            <div class="input-container">
                <span>${this.labels[this.config.options?.target ?? 0]}</span>
                <rf-range-input
                    .min=${0}
                    .max=${2}
                    .value=${this.config.options?.target}
                    .step=${1}
                    @value-change=${this.onTargetChange}>
                </rf-range-input>
            </div>
        `
    }

    private onTargetChange(ev: ValueChangeEvent<0 | 1 | 2>) {
        this.config = {
            ...this.config,
            options: {
                ...this.config.options,
                target: ev.value || 0
            }
        }
        this.dispatchEvent(new FormSubmitEvent({
            value: { rhythmicDispersion: { ...this.config } }
        }))
    }
}

import { Injectable } from 'cewdi'
import { css, html, property } from 'lit-element'
import { RestProportionConfig } from '../../../genetic-algorithm/fitness/rest-proportion-config'
import { OptionsFormService } from '../../../services'
import { headingsStyles } from '../../common/headings.styles'
import { ValueChangeEvent } from '../../common/value-change-event'
import { BaseElement } from '../../core/base-element'
import { FormSubmitEvent } from '../form-submit-event'

@Injectable()
export class RestProportionFitnessElement extends BaseElement {
    static get styles() {
        return [
            super.styles,
            headingsStyles,
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
    config: RestProportionConfig

    constructor(private readonly formService: OptionsFormService) {
        super()

        this.config = this.formService.get('restProportion') as RestProportionConfig
        if (!this.config) {
            throw new Error('RestProportionConfig was undefined')
        }
    }

    render() {
        return html`
            <h5>Rest Proportion</h5>
            <div class="input-container">
                <span>${Math.floor((this.config.options?.targetProportion ?? 0) * 100)}%</span>
                <rf-range-input
                    .min=${0}
                    .max=${1}
                    .value=${this.config.options?.targetProportion}
                    .step=${0.05}
                    @value-change=${this.onProportionChange}>
                </rf-range-input>
            </div>
        `
    }

    private onProportionChange(ev: ValueChangeEvent<number>) {
        this.config = {
            ...this.config,
            options: {
                ...this.config.options,
                targetProportion: ev.value || 0
            }
        }
        this.submitChange()
    }

    private submitChange() {
        this.dispatchEvent(new FormSubmitEvent({
            value: {
                restProportion: { ...this.config }
            }
        }))
    }
}

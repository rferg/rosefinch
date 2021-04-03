import { Injectable } from 'cewdi'
import { css, html, property } from 'lit-element'
import { FitnessMethod, RestProportionConfig } from '../../../genetic-algorithm'
import { StateMediatorService, StateSubscription, StateTopic } from '../../../services/state'
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
    config: RestProportionConfig = {
        weight: 1,
        method: FitnessMethod.RestProportion,
        options: { targetProportion: 0.1 }
    }

    private readonly stateSubscription: StateSubscription

    constructor(private readonly stateMediatorService: StateMediatorService) {
        super()

        this.stateSubscription = this.stateMediatorService.subscribe(StateTopic.OptionsForm, ({ restProportion }) => {
            this.config = { ...restProportion }
            if (!this.config) {
                throw new Error('RestProportionConfig was undefined')
            }
        })
    }

    disconnectedCallback() {
        this.stateSubscription && this.stateSubscription.unsubscribe()
        super.disconnectedCallback()
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

import { Injectable } from 'cewdi'
import { css, html, internalProperty, property } from 'lit-element'
import { FitnessMethod, RepeatedSequencesConfig, RepeatedSequenceType } from '../../../genetic-algorithm'
import { OptionsFormService } from '../../../services'
import { headingsStyles } from '../../common/headings.styles'
import { ValueChangeEvent } from '../../common/value-change-event'
import { BaseElement } from '../../core/base-element'
import { FormSubmitEvent } from '../form-submit-event'

@Injectable()
export class RepeatedSequencesFitnessElement extends BaseElement {
    static get styles() {
        return [
            super.styles,
            headingsStyles,
            css`
                :host {
                    width: 100%;
                }
                div {
                    width: 100%;
                    display: flex;
                    flex-flow: column nowrap;
                    align-items: center;
                    justify-content: center;
                    padding: var(--padding);
                }
                div > * {
                    width: 100%;
                }
                div label, h5 {
                    text-align: center;
                }
            `
        ]
    }

    private _config: RepeatedSequencesConfig = {
        method: FitnessMethod.RepeatedSequences,
        options: { types: [ { type: RepeatedSequenceType.Pitch, minLength: 3 } ] }
    }
    @property()
    get config(): RepeatedSequencesConfig {
        return this._config
    }
    set config(val: RepeatedSequencesConfig) {
        if (val !== this.config) {
            const oldVal = this._config
            this._config = val
            this.requestUpdate('config', oldVal)
                .then(() => {
                    this.minLength = this.getPitchConfigMinLength()
                    this.submitChange()
                })
                .catch(err => console.error(err))
        }
    }

    @internalProperty()
    private minLength = 3

    private readonly maxLength: number

    constructor(private readonly formService: OptionsFormService) {
        super()

        this.config = this.formService.get('repeatedSequences') as RepeatedSequencesConfig
        if (!this.config) {
            throw new Error('RepeatedSequencesConfig is undefined')
        }
        // We will temporarily only support the Pitch type sequences.
        if (!this.config.options?.types?.length) {
            throw new Error('RepeatedSequencesConfig types array is empty or undefined')
        }
        if (!this.config.options.types.find(t => t.type === RepeatedSequenceType.Pitch)) {
            throw new Error('RepeatedSequencesConfig does not contain Pitch type')
        }

        this.maxLength = this.formService.getMaxRepeatedSequenceLength()
    }

    render() {
        return html`
            <h5>Pitch Patterns</h5>
            <div>
                <label>Minimum repeated pattern length: ${this.minLength}</label>
                <rf-range-input
                    name="pitchMinLength"
                    .min=${2}
                    .max=${this.maxLength}
                    .value=${this.minLength}
                    .step=${1}
                    @value-change=${this.onMinLengthChange}>
                </rf-range-input>
            </div>
        `
    }

    private onMinLengthChange(ev: ValueChangeEvent<number>) {
        ev.stopPropagation()
        const minLength = ev.value
        this.config = {
            ...this.config,
            options: {
                ...this.config.options,
                types: this.config.options.types.map(t => {
                    if (t.type !== RepeatedSequenceType.Pitch) { return t }
                    return {
                        ...t,
                        minLength
                    }
                })
            }
        }
    }

    private getPitchConfigMinLength(): number {
        const minLength = this.config.options.types.find(t => t.type === RepeatedSequenceType.Pitch)?.minLength
        if (!minLength) {
            throw new Error('Missing Pitch type')
        }
        return minLength
    }

    private submitChange() {
        this.dispatchEvent(new FormSubmitEvent({
            value: {
                repeatedSequences: { ...this.config }
            }
        }))
    }
}

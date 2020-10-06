import { Injectable } from 'cewdi'
import { css, html, property } from 'lit-element'
import { Instrument, PlaybackOptions } from '../../services/playback'
import { Icon } from '../common/icon'
import { cancelEventType } from '../options/cancel-event-type'
import { FormStatusEvent } from '../options/form-status-event'
import { FormSubmitEvent } from '../options/form-submit-event'
import { FormElement } from '../options/form.element'
import { numberRangeFieldValidatorFactory } from '../options/number-range-field-validator-factory'

@Injectable()
export class PlaybackOptionsElement extends FormElement<PlaybackOptions> {
    static get styles() {
        return [
            super.styles,
            css`
                :host {
                    width: 100%;
                    max-height: 90vh;
                    overflow-y: auto;
                }
                rf-container {
                    width: 100%;
                    margin: 0;
                }
                rf-inside-container {
                    justify-content: space-between;
                    padding: var(--small-padding) var(--padding);
                }
                div {
                    width: 100%;
                    display: flex;
                    flex-flow: row wrap;
                    align-items: center;
                    justify-content: space-around;
                    margin-top: var(--padding);
                }
                @media screen and (max-width: 900px) {
                    rf-inside-container {
                        flex-direction: column;
                    }
                }
                @media screen and (max-width: 768px) {
                    :host {
                        width: 90vw;
                    }
                }
            `
        ]
    }

    @property({ reflect: true, type: Boolean })
    valid = true

    private _options?: PlaybackOptions
    @property()
    get options(): PlaybackOptions {
        return this._options || {}
    }
    set options(val: PlaybackOptions) {
        if (val !== this._options) {
            const oldVal = this._options
            this._options = val
            this.value = { ...this.options }
            // tslint:disable-next-line: no-floating-promises
            this.requestUpdate('options', oldVal)
        }
    }

    private readonly instrumentOptions: { label: string, value: string | number }[]

    constructor() {
        super()
        this.instrumentOptions = Object.keys(Instrument).map(key => {
            const value = Instrument[key as Instrument]
            return { label: value, value }
        })
        this.addEventListener(FormStatusEvent.eventType, ev => {
            ev.stopPropagation()
            this.valid = (ev as FormStatusEvent)?.isValid ?? false
        })
    }

    render() {
        return html`
            <rf-container>
                <h3>Playback Options</h3>
                <rf-inside-container>
                    <label for="instrument">Instrument</label>
                    <rf-input inputType="select"
                        id="instrument"
                        name="instrument"
                        .options=${this.instrumentOptions}
                        .value=${this.value?.instrument}></rf-input>
                </rf-inside-container>
                <rf-inside-container>
                    <label for="bpm">Tempo (BPM)</label>
                    <rf-input inputType="number"
                        id="bpm"
                        name="bpm"
                        .value=${this.value?.bpm}
                        .validator=${numberRangeFieldValidatorFactory(0, 300, 'Tempo')}></rf-input>
                </rf-inside-container>
                <rf-inside-container>
                    <label for="loop">Loop Playback</label>
                    <rf-input inputType="select"
                        id="loop"
                        name="loop"
                        .options=${[ { value: false, label: 'No' }, { value: true, label: 'Yes' } ]}
                        .value=${!!this.value?.loop}></rf-input>
                </rf-inside-container>
                <div>
                    <rf-button buttonRole="danger"
                        @click=${this.onCancel}
                        title="Cancel">
                        <rf-icon icon=${Icon.Cross}></rf-icon>
                    </rf-button>
                    <rf-button
                        buttonRole="success"
                        @click=${this.onSubmit}
                        ?disabled=${!this.valid}
                        title="Save">
                        <rf-icon icon=${Icon.Check}></rf-icon>
                    </rf-button>
                </div>
            </rf-container>
        `
    }

    onSubmit() {
        if (this.valid) {
            this.dispatchEvent(new FormSubmitEvent<PlaybackOptions>({ value: this.value || {} }))
        }
    }

    onCancel() {
        this.dispatchEvent(new CustomEvent(cancelEventType))
    }
}

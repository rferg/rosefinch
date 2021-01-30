import { Injectable } from 'cewdi'
import { css, html, property } from 'lit-element'
import { Pitch } from '../../common/pitch'
import { ScaleIntervalOptions } from '../../genetic-algorithm'
import { ScaleName, ScaleService } from '../../services'
import { Icon } from '../common/icon'
import { BaseElement } from '../core/base-element'
import { FormFieldChangeEvent } from './form-field-change-event'
import { FormSubmitEvent } from './form-submit-event'

@Injectable()
export class ScaleFitnessElement extends BaseElement {
    static get styles() {
        return [
            super.styles,
            css`
                div {
                    width: 100%;
                    display: flex;
                    flex-flow: row wrap;
                    align-items: center;
                    justify-content: space-around;
                    margin-top: var(--padding);
                }
            `
        ]
    }

    @property()
    options?: ScaleIntervalOptions

    @property()
    get root(): Pitch {
        return this.options?.scale?.pitches?.[ 0 ] ?? this.defaultRoot
    }

    private readonly defaultRoot = Pitch.C

    private readonly scaleOptions: { value: string, label: string }[] =
        [ { value: '', label: '' }, ...Object.keys(ScaleName).map(k => ({ value: k, label: k })) ]

    constructor(private readonly service: ScaleService) {
        super()
    }

    render() {
        return html`
            <rf-input inputType="select"
                .value=${this.options?.scale?.name ?? ''}
                .options=${this.scaleOptions}
                name="scaleName"
                @form-field-change=${this.onScaleChange}>
            </rf-input>
            <div>
                <rf-button buttonRole="danger"
                    @click=${this.onCancel}
                    title="Cancel">
                    <rf-icon icon=${Icon.Cross}></rf-icon>
                </rf-button>
                <rf-button
                    buttonRole="success"
                    @click=${this.onSubmit}
                    title="Save">
                    <rf-icon icon=${Icon.Check}></rf-icon>
                </rf-button>
            </div>
            `
    }

    private onScaleChange(ev: FormFieldChangeEvent) {
        const name = ev.value.scaleName || ''
        const pitches = name ? this.service.getPitches(this.root, name) : []
        this.options = {
            ...(this.options || { intervalScores: [] }),
            scale: { name, pitches }
        }
    }

    private onCancel() {
        this.dispatchEvent(new CustomEvent('cancel', { bubbles: true, composed: true }))
    }

    private onSubmit() {
        if (this.options) {
            this.dispatchEvent(new FormSubmitEvent<ScaleIntervalOptions>({ value: { ...this.options } }))
        }
    }
}

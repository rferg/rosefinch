import { FormElement } from './form.element'
import { css, html, internalProperty, TemplateResult } from 'lit-element'
import { FitnessForm } from './fitness-form'
import { Injectable } from 'cewdi'
import { ValueChangeEvent } from '../common/value-change-event'
import { FormFieldChangeEvent } from './form-field-change-event'
import { FormSubmitEvent } from './form-submit-event'
import {
    ChordFitOptions,
    PitchSequenceDirectionOptions,
    RestProportionOptions,
    RhythmicDispersionOptions,
    ScaleIntervalOptions
} from '../../genetic-algorithm'
import { Pitch } from '../../common/pitch'
interface FormItemConfig {
    key: keyof FitnessForm
    title: string
    valueTextFactory: (options: FitnessConfigOptions | undefined) => string
    editTemplateFactory: (options: FitnessConfigOptions | undefined) => TemplateResult
}

type FitnessConfigOptions = ChordFitOptions | ScaleIntervalOptions |
    RestProportionOptions | PitchSequenceDirectionOptions | RhythmicDispersionOptions
@Injectable()
export class FitnessFormElement extends FormElement<FitnessForm> {
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

    private readonly itemConfigs: FormItemConfig[] = [
        {
            key: 'scale',
            title: 'Scale',
            valueTextFactory: (options: FitnessConfigOptions | undefined) =>
                (options as ScaleIntervalOptions)?.scale?.map(p => Pitch[p]).join(',') ?? '',
            editTemplateFactory: (options: FitnessConfigOptions | undefined) =>
                html`<rf-scale-fitness .options=${options}></rf-scale-fitness>`
        }
    ]

    @internalProperty()
    private currentlyEditing?: { key: keyof FitnessForm, template: TemplateResult }

    render() {
        return html`
            ${this.itemConfigs.map(({ key, title, valueTextFactory, editTemplateFactory }) => {
                const value = (this.value || {})[key]
                return html`<rf-fitness-form-item
                    .weight=${value?.weight}
                    .itemTitle=${title}
                    .valueText=${valueTextFactory(value?.options)}
                    @edit=${() =>
                        this.onEditOptions(key, editTemplateFactory(value ? { ...value.options } : undefined))}
                    @value-change=${(ev: ValueChangeEvent<number>) =>
                        this.onWeightChange(key, ev)}>
                    </rf-fitness-form-item>`
            })}
            <rf-popup ?show=${!!this.currentlyEditing}>
                <rf-container @cancel=${this.onEditOptionsCancel} @form-submit=${this.onEditOptionsSubmit}>
                    ${this.currentlyEditing?.template}
                </rf-container>
            </rf-popup>
        `
    }

    private onEditOptions(key: keyof FitnessForm, template: TemplateResult) {
        this.currentlyEditing = { key, template }
    }

    private onEditOptionsCancel() {
        this.currentlyEditing = undefined
    }

    private onEditOptionsSubmit(ev: FormSubmitEvent<any>) {
        if (this.currentlyEditing) {
            ev.stopImmediatePropagation()
            this.dispatchEvent(new FormFieldChangeEvent({
                value: {
                        [this.currentlyEditing.key]: {
                        ...(this.value || {})[this.currentlyEditing.key], options: ev.value
                    }
                },
                isValid: true
            }))
            this.currentlyEditing = undefined
        }
    }

    private onWeightChange(key: keyof FitnessForm, ev: ValueChangeEvent<number>) {
        ev.stopImmediatePropagation()
        this.dispatchEvent(new FormFieldChangeEvent({
            value: { [key]: { ...(this.value || {})[key], weight: ev.value } },
            isValid: true
        }))
    }
}

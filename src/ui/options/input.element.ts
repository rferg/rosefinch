import { BaseElement } from '../core/base-element'
import { css, html, property, query, TemplateResult } from 'lit-element'
import { assertUnreachable } from '../../common/assert-unreachable'
import { FormFieldChangeEvent } from './form-field-change-event'
import { animationsStyles } from '../common/animations.styles'
import { FieldValidator } from './field-validator'
import { Injectable } from 'cewdi'

@Injectable()
export class InputElement extends BaseElement {
    static get styles() {
        return [
            super.styles,
            animationsStyles,
            css`
                :host {
                    display: block;
                }
                input, select {
                    outline: none;
                    background-color: transparent;
                    padding: calc(var(--small-padding) / 2) var(--small-padding);
                    border: none;
                    border-bottom: 1px solid var(--primary-color);
                    font-weight: var(--regular-weight);
                    transition: background-color var(--short-animation-duration) var(--easing);
                    animation: fadeIn var(--short-animation-duration) var(--easing);
                    font-size: var(--font-size);
                    border-radius: var(--border-radius);
                    border-bottom-right-radius: 0;
                    border-bottom-left-radius: 0;
                    text-align: center;
                    width: auto;
                    text-overflow: ellipsis;
                }
                input {
                    max-width: 6rem;
                }
                input[type=number]::-webkit-outer-spin-button,
                input[type=number]::-webkit-inner-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
                input[type=number] {
                    -moz-appearance: textfield;
                }
                input:focus, input:hover, select:hover, select:focus  {
                    background-color: var(--light-primary-color);
                }
                :host([invalid]) input, :host([invalid]) select {
                    color: var(--danger-color);
                    border-color: var(--danger-color);
                    background-color: var(--light-danger-color);
                }
                select {
                    -moz-appearance: none;
                }
            `
        ]
    }

    @property()
    name?: string

    @property()
    inputType: 'text' | 'number' | 'select' = 'text'

    @property()
    value?: string | number

    @property({ attribute: false })
    options?: { label: string, value: string | number }[]

    @property({ reflect: true, type: Boolean })
    invalid = false

    @query('input, select')
    inputElement?: HTMLInputElement | HTMLSelectElement

    @property()
    validator: FieldValidator = (_?: string | number) => {
        return { isValid: true }
    }

    render() {
        return this.getInputTemplate()
    }

    private getInputTemplate(): TemplateResult {
        switch (this.inputType) {
            case 'text':
                return html`
                    <input type="text"
                        .value="${this.value?.toString() ?? ''}"
                        @change=${this.onChange}/>
                    `
            case 'number':
                return html`
                    <input type="number"
                        .value="${this.value?.toString() ?? ''}"
                        @change=${this.onChange}/>
                    `
            case 'select':
                return html`
                    <select .value="${this.value?.toString() ?? ''}"
                        @change=${this.onChange}>
                        ${(this.options || [])
                            .map(({ label, value }) =>
                                html`<option value=${value} ?selected=${value === this.value}>${label}</option>`)}
                    </select>
                `
            default:
                assertUnreachable(this.inputType, `Invalid input type ${this.inputType}.`)
        }
    }

    private onChange(event: Event): void {
        if (!this.name) {
            throw new Error(`EditableTextInput must have a name, but none was given.`)
        }
        const inputValue = (event.target as HTMLInputElement | HTMLSelectElement)?.value
        const value = this.valueIsNumber(this.value)
            ? (inputValue && Number.parseFloat(inputValue)) || 0
            : inputValue
        this.value = value
        const { isValid, errors } = this.validator(this.value)
        this.invalid = !isValid
        this.dispatchEvent(new FormFieldChangeEvent({
            value: { [this.name]: this.value },
            isValid,
            errors
        }))
    }

    private valueIsNumber(value: any): value is number {
        return !!(value as number)?.toExponential || this.inputType === 'number'
    }
}

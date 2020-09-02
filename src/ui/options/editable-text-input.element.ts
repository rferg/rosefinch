import { BaseElement } from '../core/base-element'
import { css, html, internalProperty, property, query, TemplateResult } from 'lit-element'
import { assertUnreachable } from '../../common/assert-unreachable'
import { FormErrorEvent } from './form-error-event'
import { FormChangeEvent } from './form-change-event'
import { animationsStyles } from '../common/animations.styles'

export class EditableTextInputElement extends BaseElement {
    static get styles() {
        return [
            super.styles,
            animationsStyles,
            css`
                :host {
                    display: block;
                }
                button, input, select {
                    outline: none;
                    background-color: transparent;
                    padding: calc(var(--small-padding) / 2) var(--small-padding);
                    border: none;
                    border-bottom: 1px solid var(--primary-color);
                    font-weight: var(--regular-weight);
                    transition: background-color var(--short-animation-duration) var(--easing);
                    cursor: pointer;
                    animation: fadeIn var(--short-animation-duration) var(--easing);
                    font-size: var(--font-size);
                    border-radius: var(--border-radius);
                    border-bottom-right-radius: 0;
                    border-bottom-left-radius: 0;
                    text-align: center;
                    width: auto;
                }
                input, select {
                    text-overflow: ellipsis;
                }
                input {
                    max-width: 10rem;
                }
                input[type=number]::-webkit-outer-spin-button,
                input[type=number]::-webkit-inner-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
                input[type=number] {
                    -moz-appearance: textfield;
                }
                button:hover, select:hover  {
                    background-color: var(--light-primary-color);
                }
                :host([invalid="true"]) button, :host([invalid="true"]) input, :host([invalid="true"]) select {
                    color: var(--danger-color);
                    border-color: var(--danger-color);
                    background-color: var(--light-danger-color);
                }
                select {
                    -moz-appearance: none;
                    -webkit-appearance: none;
                }
            `
        ]
    }

    @property()
    inputType: 'text' | 'number' | 'select' = 'text'

    @property()
    value?: string | number

    @property({ reflect: false })
    validator?: (value?: string | number) => { isValid: boolean, errors: string[] }

    @property({ reflect: false })
    options?: { label: string, value: string | number }[]

    @property({ reflect: true })
    invalid = false

    @query('input, select')
    inputElement?: HTMLInputElement | HTMLSelectElement

    @internalProperty()
    private isEditing = false

    @property({ reflect: false })
    formatter: (value?: string | number) => string = value => {
        if (value === undefined) { return '' }
        if (value.toLocaleString) { return value.toLocaleString() }
        return value.toString()
    }

    render() {
        return html`
            ${this.isEditing ? this.getInputTemplate() : this.getTextTemplate()}
        `
    }

    private getTextTemplate(): TemplateResult {
        if (this.inputType === 'select') { return this.getInputTemplate() }
        return html`
            <button type="button" @click=${this.onTextClick} @focus=${this.onTextClick}>
                ${this.formatter(this.value)}
            </button>`
    }

    private getInputTemplate(): TemplateResult {
        switch (this.inputType) {
            case 'text':
                return html`
                    <input type="text"
                        .value="${this.value?.toString() ?? ''}"
                        @change=${this.onChange}
                        @blur=${this.onBlur} />
                    `
            case 'number':
                return html`
                    <input type="number"
                        .value="${this.value?.toString() ?? ''}"
                        @change=${this.onChange}
                        @blur=${this.onBlur} />
                    `
            case 'select':
                return html`
                    <select .value="${this.value?.toString() ?? ''}"
                        @change=${this.onChange}
                        @blur=${this.onBlur}>
                        ${(this.options || [])
                            .map(({ label, value }) => html`<option value=${value}>${label}</option>`)}
                    </select>
                `
            default:
                assertUnreachable(this.inputType, `Invalid input type ${this.inputType}.`)
        }
    }

    private onTextClick(): void {
        this.isEditing = true
        setTimeout(() => {
            if (this.inputElement) {
                this.inputElement.focus()
            }
        }, 0)
    }

    private onBlur() {
        this.isEditing = false
    }

    private onChange(event: Event): void {
        const inputValue = (event.target as HTMLInputElement | HTMLSelectElement)?.value
        const value = this.valueIsNumber(this.value)
            ? (inputValue && Number.parseFloat(inputValue)) || 0
            : inputValue
        if (this.validator) {
            const { isValid, errors } = this.validator(value)
            this.invalid = !isValid
            if (errors && errors.length) {
                this.dispatchEvent(new FormErrorEvent({ errors }))
            }
        }
        this.value = value
        this.dispatchEvent(new FormChangeEvent({ value: this.value }))
    }

    private valueIsNumber(value: any): value is number {
        return !!(value as number)?.toExponential || this.inputType === 'number'
    }
}
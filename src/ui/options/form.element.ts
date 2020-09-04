import { BaseElement } from '../core/base-element'
import { FormStatusEvent } from './form-status-event'
import { FormFieldChangeEvent } from './form-field-change-event'
import { internalProperty, property } from 'lit-element'

export class FormElement<T extends { [key: string]: any }> extends BaseElement {
    static get styles() {
        return [
            super.styles
        ]
    }

    @property()
    value?: T

    @internalProperty()
    protected errors: { [key: string]: string[] } = {}

    private _isValid = true
    private get isValid() {
        return this._isValid
    }
    private set isValid(value: boolean) {
        if (value !== this._isValid) {
            this._isValid = value
            this.onStatusChange()
        }
    }

    private readonly validMap: { [key: string]: boolean } = {}

    constructor() {
        super()
        this.addEventListener(FormFieldChangeEvent.eventType, this.onFieldChange.bind(this))
    }

    private onFieldChange(ev: Event) {
        if (this.isFormFieldChangeEvent(ev)) {
            ev.stopPropagation()
            this.value = { ...(this.value || {} as T), ...ev.value }
            if (Object.keys(ev.value).length) {
                const propertyKey = Object.keys(ev.value)[0]
                this.validMap[propertyKey] = ev.isValid
                this.errors = { ...this.errors, [propertyKey]: ev.errors || [] }
                this.isValid = Object.keys(this.validMap).map(key => this.validMap[key]).every(value => value)
            }
        }
    }

    private onStatusChange() {
        this.dispatchEvent(new FormStatusEvent({ isValid: this.isValid }))
    }

    private isFormFieldChangeEvent(ev: Event): ev is FormFieldChangeEvent {
        const event = ev as FormFieldChangeEvent
        // tslint:disable-next-line: strict-type-predicates
        return event?.value && event?.isValid !== undefined
    }
}

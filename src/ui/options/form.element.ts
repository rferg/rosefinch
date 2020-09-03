import { BaseElement } from '../core/base-element'
import { FormStatusEvent } from './form-status-event'
import { FormFieldChangeEvent } from './form-field-change-event'
import { internalProperty } from 'lit-element'

export class FormElement<T extends { [key: string]: any }> extends BaseElement {
    static get styles() {
        return [
            super.styles
        ]
    }

    @internalProperty()
    protected errors: { [key: string]: string[] } = {}

    private _value?: T
    get value(): T | undefined {
        return this._value
    }
    set value(val: T | undefined) {
        if (val !== this._value) {
            this._value = val
        }
    }

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

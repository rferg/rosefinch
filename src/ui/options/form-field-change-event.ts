import { FormFieldChange } from './form-field-change'

export class FormFieldChangeEvent extends CustomEvent<FormFieldChange> {
    static get eventType() { return 'form-field-change' }

    get value() { return this.detail.value }
    get isValid() { return this.detail.isValid }
    get errors() { return this.detail.errors }

    constructor(detail: FormFieldChange) {
        super(FormFieldChangeEvent.eventType, { detail, bubbles: true, composed: true })
    }
}

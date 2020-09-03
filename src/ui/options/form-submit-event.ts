export class FormSubmitEvent<T extends { [key: string]: any }> extends CustomEvent<{ value: T }> {
    static get eventType() { return 'form-submit' }

    get value() {
        return this.detail.value
    }

    constructor(detail: { value: T }) {
        super(FormSubmitEvent.eventType, { detail, bubbles: true, composed: true })
    }
}

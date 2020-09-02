export class FormErrorEvent extends CustomEvent<{ errors: string[] }> {
    static get eventType() { return 'form-error' }

    get errors() { return this.detail.errors }

    constructor(detail: { errors: string[] }) {
        super(FormErrorEvent.eventType, { detail, bubbles: true, composed: true })
    }
}

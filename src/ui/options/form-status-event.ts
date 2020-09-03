export class FormStatusEvent extends CustomEvent<{ isValid: boolean }> {
    static get eventType() { return 'form-status' }

    get isValid() {
        return this.detail.isValid
    }

    constructor(detail: { isValid: boolean }) {
        super(FormStatusEvent.eventType, { detail, bubbles: true, composed: true })
    }
}

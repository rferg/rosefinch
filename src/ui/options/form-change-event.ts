export class FormChangeEvent extends CustomEvent<{ value: any }> {
    static get eventType() { return 'form-change' }

    get value() { return this.detail.value }

    constructor(detail: { value: any }) {
        super(FormChangeEvent.eventType, { detail, bubbles: true, composed: true })
    }
}

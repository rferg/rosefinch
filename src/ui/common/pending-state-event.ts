export class PendingStateEvent extends CustomEvent<Promise<any>> {
    static get is(): string { return 'pending-state' }

    get waitOn(): Promise<any> { return this.detail }

    constructor(promise: Promise<any>) {
        super(PendingStateEvent.is, { detail: promise, bubbles: true, composed: true })
    }
}

import { valueChangeEventType } from './value-change-event-type'

export class ValueChangeEvent<T> extends CustomEvent<T> {
    get value(): T { return this.detail }

    constructor(value: T) {
        super(valueChangeEventType, { detail: value, bubbles: true })
    }
}

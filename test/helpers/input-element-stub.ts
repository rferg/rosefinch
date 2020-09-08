import { BaseElement } from '../../src/ui/core/base-element'
import { property } from 'lit-element'
import { FieldValidator } from '../../src/ui/options/field-validator'

export class InputElementStub extends BaseElement {
    static get is() { return 'rf-input' }

    @property()
    name?: string

    @property()
    inputType: 'text' | 'number' | 'select' = 'text'

    @property()
    value?: string | number

    @property({ attribute: false })
    options?: { label: string, value: string | number }[]

    @property({ reflect: true, type: Boolean })
    invalid = false

    @property()
    validator: FieldValidator = (_?: string | number) => {
        return { isValid: true }
    }
}

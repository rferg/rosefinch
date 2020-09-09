import { FormElement } from './form.element'
import { css, html } from 'lit-element'
import { FitnessForm } from './fitness-form'

export class FitnessFormElement extends FormElement<FitnessForm> {
    static get styles() {
        return [
            super.styles,
            css``
        ]
    }

    render() {
        return html`<div style="height:60vh;">fitness form</div>`
    }
}

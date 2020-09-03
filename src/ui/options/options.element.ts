import { BaseElement } from '../core/base-element'
import { css, html } from 'lit-element'
import { headingsStyles } from '../common/headings.styles'
import { FormFieldChangeEvent } from './form-field-change-event'

export class OptionsElement extends BaseElement {
    static get styles() {
        return [
            super.styles,
            headingsStyles,
            css`
                :host {
                    display: flex;
                    height: 100%;
                    width: 100%;
                    justify-content: center;
                    align-items: center;
                }
                rf-container {
                    flex-grow: 0;
                    width: 960px;
                    max-width: 100vw;
                }
            `
        ]
    }

    render() {
        return html`
            <rf-container>
                <h3>Setup New Session</h3>
                <rf-editable-text-input
                    .value=${4}
                    inputType="number"
                    name="test"
                    .validator=${(value?: string | number) => ({ isValid: (value as number) > 4, errors: [] })}
                    @form-field-change=${(ev: FormFieldChangeEvent) => console.log(ev)}>
                </rf-editable-text-input>
            </rf-container>
        `
    }
}

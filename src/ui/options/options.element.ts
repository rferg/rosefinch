import { BaseElement } from '../core/base-element'
import { css, html } from 'lit-element'
import { headingsStyles } from '../common/headings.styles'
import { FormChangeEvent } from './form-change-event'
import { FormErrorEvent } from './form-error-event'

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
                    .options=${[
                        { label: 'Number 4', value: 4 },
                        { label: 'Number 3', value: 3 },
                        { label: 'Number 2', value: 2 }
                    ]}
                    inputType="select"
                    @form-change=${(ev: FormChangeEvent) => console.log(ev.value)}
                    @form-error=${(ev: FormErrorEvent) => console.log(ev.errors)}>
                </rf-editable-text-input>
            </rf-container>
        `
    }
}

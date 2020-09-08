import { BaseElement } from '../core/base-element'
import { css, html } from 'lit-element'
import { headingsStyles } from '../common/headings.styles'
import { Icon } from '../common/icon'
import { SizeForm } from './size-form'
import { FormSubmitEvent } from './form-submit-event'

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
                rf-form-tab {
                    width: 100%;
                }
                rf-size-form {
                    width: 100%;
                }
            `
        ]
    }

    private readonly sizeForm: SizeForm = {
        populationSize: 5000,
        timeSignatureTop: 4,
        timeSignatureBottom: 4,
        octaveMax: 6,
        octaveMin: 3,
        shortestNoteDuration: 8,
        measures: 8
    }

    render() {
        return html`
            <rf-container>
                <rf-form-tab .submitButton=${{ role: 'primary' as 'primary', icon: Icon.RightArrow }}
                    @form-submit=${ (ev: FormSubmitEvent<SizeForm>) => console.log(ev) }>
                    <rf-size-form .value=${this.sizeForm as any} slot="form"></rf-size-form>
                </rf-form-tab>
            </rf-container>
        `
    }
}

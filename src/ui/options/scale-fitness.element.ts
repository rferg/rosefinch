import { Injectable } from 'cewdi'
import { css, html, property } from 'lit-element'
import { ScaleIntervalOptions } from '../../genetic-algorithm'
import { Icon } from '../common/icon'
import { BaseElement } from '../core/base-element'
import { FormSubmitEvent } from './form-submit-event'

@Injectable()
export class ScaleFitnessElement extends BaseElement {
    static get styles() {
        return [
            super.styles,
            css`
                div {
                    width: 100%;
                    display: flex;
                    flex-flow: row wrap;
                    align-items: center;
                    justify-content: space-around;
                    margin-top: var(--padding);
                }
            `
        ]
    }

    @property()
    options?: ScaleIntervalOptions

    render() {
        return html`
            <p>scale fitness</p>
            <div>
                <rf-button buttonRole="danger"
                    @click=${this.onCancel}
                    title="Cancel">
                    <rf-icon icon=${Icon.Cross}></rf-icon>
                </rf-button>
                <rf-button
                    buttonRole="success"
                    @click=${this.onSubmit}
                    title="Save">
                    <rf-icon icon=${Icon.Check}></rf-icon>
                </rf-button>
            </div>
            `
    }

    private onCancel() {
        this.dispatchEvent(new CustomEvent('cancel', { bubbles: true, composed: true }))
    }

    private onSubmit() {
        if (this.options) {
            this.dispatchEvent(new FormSubmitEvent<ScaleIntervalOptions>({ value: { ...this.options } }))
        }
    }
}

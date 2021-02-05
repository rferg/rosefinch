import { Injectable } from 'cewdi'
import { css, html } from 'lit-element'
import { Icon } from '../common/icon'
import { BaseElement } from '../core/base-element'

@Injectable()
export class FitnessFormItemButtonsElement extends BaseElement {
    static get styles() {
        return [
            super.styles,
            css`
                :host {
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

    render() {
        return html`
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
        `
    }

    private onCancel() {
        this.dispatchEvent(new CustomEvent('cancel'))
    }

    private onSubmit() {
        this.dispatchEvent(new CustomEvent('submit'))
    }
}

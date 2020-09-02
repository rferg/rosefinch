import { BaseElement } from '../core/base-element'
import { css, html } from 'lit-element'
import { headingsStyles } from '../common/headings.styles'

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
            </rf-container>
        `
    }
}

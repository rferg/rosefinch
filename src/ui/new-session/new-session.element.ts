import { BaseElement } from '../core/base-element'
import { css, html } from 'lit-element'
import { Icon } from '../common/icon'
import { headingsStyles } from '../common/headings.styles'

export class NewSessionElement extends BaseElement {
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
                rf-inside-container {
                    flex-grow: 1;
                    width: 100%;
                    justify-content: space-around;
                }
                rf-inside-container > * {
                    margin: 1rem;
                }
                @media screen and (max-width: 768px) and (orientation: portrait),
                screen and (max-width: 1024px) and (orientation: landscape) {
                    rf-container {
                        margin-left: 0;
                        margin-right: 0;
                    }
                }
            `
        ]
    }

    render() {
        return html`
        <rf-container>
            <rf-inside-container>
                <a href="/options">
                    <rf-button buttonRole="${'success'}" title="Create a new session">
                        <rf-icon icon="${Icon.Plus}"></rf-icon>
                    </rf-button>
                </a>
                <h3>New Session</h3>
            </rf-inside-container>
        </rf-container>
        `
    }
}

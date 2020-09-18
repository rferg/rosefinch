import { html } from '@open-wc/testing-helpers'
import { Injectable } from 'cewdi'
import { css, property } from 'lit-element'
import { headingsStyles } from '../common/headings.styles'
import { Icon } from '../common/icon'
import { BaseElement } from '../core/base-element'
import { PopupContent } from './popup-content'

@Injectable()
export class RepresentativesHeaderElement extends BaseElement {
    static get styles() {
        return [
            super.styles,
            headingsStyles,
            css`
                :host {
                    display: flex;
                    width: 100%;
                    align-items: center;
                    justify-content: center;
                }
                rf-container {
                    flex-grow: 1;
                    flex-flow: row wrap;
                    align-items: center;
                    justify-content: space-between;
                    padding: var(--small-padding) var(--padding);
                    margin: var(--small-padding);
                }
                rf-container > * {
                    flex-grow: 1;
                }
                h2 {
                    text-align: left;
                    margin: 0;
                }
                div {
                    display: flex;
                    flex-flow: row nowrap;
                    align-items: center;
                    justify-content: flex-end;
                }
                div rf-button {
                    margin-left: var(--small-padding);
                }
                @media screen and (max-width: 768px) {
                    h2 {
                        font-size: var(--font-size);
                    }
                    div rf-button {
                        margin-left: calc(var(--small-padding) * (1/2));
                    }
                }
                @media screen and (max-width: 450px) {
                    rf-container {
                        flex-direction: column-reverse;
                    }
                    h2 {
                        margin-top: 1rem;
                    }
                }
            `
        ]
    }

    @property()
    generation?: number

    render() {
        return html`
            <rf-container>
                <h2>Generation ${this.generation?.toLocaleString() ?? ''}</h2>
                <div>
                    <rf-button title="Playback Options"
                        buttonRole="primary"
                        @click=${() => this.onButtonClick('playback')}>
                        <rf-icon icon="${Icon.Volume}"></rf-icon>
                    </rf-button>
                    <rf-button title="Fitness Options"
                        buttonRole="primary"
                        @click=${() => this.onButtonClick('fitness')}>
                        <rf-icon icon="${Icon.Sliders}"></rf-icon>
                    </rf-button>
                    <rf-button title="Run"
                        buttonRole="success"
                        @click=${() => this.onButtonClick('run')}>
                        <rf-icon icon="${Icon.Check}"></rf-icon>
                    </rf-button>
                </div>
            </rf-container>
        `
    }

    private onButtonClick(content: PopupContent) {
        this.dispatchEvent(new CustomEvent<PopupContent>('show-popup', { detail: content }))
    }
}

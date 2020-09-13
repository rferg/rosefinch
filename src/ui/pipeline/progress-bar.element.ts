import { Injectable } from 'cewdi'
import { css, html, property } from 'lit-element'
import { BaseElement } from '../core/base-element'

@Injectable()
export class ProgressBarElement extends BaseElement {
    static get styles() {
        return [
            super.styles,
            css`
                #container {
                    width: 100%;
                    display: block;
                    padding: 0;
                    min-width: 10rem;
                    border-radius: var(--border-radius);
                    box-shadow: var(--secondary-shadow);
                    background-color: var(--light-success-color);
                    overflow: hidden;
                }
                #bar {
                    width: 100%;
                    height: 1rem;
                    transform: scale(0,1);
                    transform-origin: left;
                    background-color: var(--success-color);
                    transition: transform 100ms var(--easing);
                    will-change: transform;
                }
            `
        ]
    }

    @property({ reflect: true, type: Number })
    percentage = 0

    render() {
        return html`
            <div id="container">
                <div id="bar" style="transform: scale(${(this.percentage / 100).toFixed(2)},1)"></div>
            </div>
        `
    }
}

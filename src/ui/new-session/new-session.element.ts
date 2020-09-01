import { BaseElement } from '../core/base-element'
import { html } from 'lit-element'
import { Icon } from '../common/icon'

export class NewSessionElement extends BaseElement {

    render() {
        return html`
        <rf-button buttonRole="${'success'}" @click=${this.onClick}>
            <rf-icon icon="${Icon.Check}"></rf-icon>Yes!
        </rf-button>
        `
    }

    private onClick(ev: Event) {
        console.log(ev)
    }
}

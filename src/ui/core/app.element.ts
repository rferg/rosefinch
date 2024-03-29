import { BaseElement } from './base-element'
import { html } from 'lit-element'
import { Injectable } from 'cewdi'

@Injectable()
export class AppElement extends BaseElement {
    render() {
        return html`
            <rf-pending></rf-pending>
            <rf-router-outlet></rf-router-outlet>
            `
    }
}

import { css, CSSResultArray, CSSResultOrNative, LitElement } from 'lit-element'
import { Injectable } from 'cewdi'

@Injectable()
export class BaseElement extends LitElement {
    static get styles(): CSSResultOrNative | CSSResultArray {
        return css`
                :host, * {
                    box-sizing: border-box;
                    font-family: var(--font-family);
                    color: var(--font-color);
                }
            `
    }
}

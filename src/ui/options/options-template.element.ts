import { Injectable } from 'cewdi'
import { css, html, internalProperty, property } from 'lit-element'
import { animationsStyles } from '../common/animations.styles'
import { Icon } from '../common/icon'
import { BaseElement } from '../core/base-element'
import { FormFieldChangeEvent } from './form-field-change-event'

@Injectable()
export class OptionsTemplateElement extends BaseElement {
    static get styles() {
        return [
            animationsStyles,
            super.styles,
            css`
                :host {
                    --half-small-padding: calc(var(--small-padding) / 2);
                    position: relative;
                    display: flex;
                    flex-flow: row nowrap;
                    width: 100%;
                    align-items: flex-end;
                    justify-content: flex-end;
                    padding-top: var(--half-small-padding);
                }
                rf-button {
                    margin-left: var(--half-small-padding);
                }
                p {
                    text-align: left;
                    padding: 0 var(--half-small-padding);
                    margin: 0;
                    font-size: var(--small-font-size);
                }
                .error-message {
                    color: var(--danger-color);
                    animation: slideInFromBottom var(--animation-duration) var(--easing);
                    border: 1px solid var(--danger-color);
                    background-color: var(--light-danger-color);
                    border-radius: var(--border-radius);
                }
                rf-inside-container {
                    margin: 0;
                    align-items: center;
                }
                #nameInputContainer {
                    position: absolute;
                    top: -50%;
                    left: 0;
                    z-index: 1;
                    width: 100%;
                    animation: slideInFromBottom var(--animation-duration) var(--easing);
                }
                #nameInputContainer label {
                    font-size: var(--small-font-size);
                    width: 100%;
                    text-align: center;
                }
                #nameInputContainer rf-inside-container {
                    flex-flow: column nowrap;
                }
                #nameInputContainer div {
                    display: flex;
                    flex-flow: row wrap;
                    align-items: stretch;
                    justify-content: center;
                    margin-top: var(--half-small-padding);
                }
            `
        ]
    }

    @property()
    templateId?: string

    @property()
    errorMessage?: string

    private _templateName?: string
    @property()
    get templateName(): string | undefined {
        return this._templateName
    }
    set templateName(val: string | undefined) {
        if (val !== this._templateName) {
            const oldVal = this._templateName
            this._templateName = val
            this.requestUpdate('templateName', oldVal)
                .then(() => this.internalTemplateName = this.templateId
                    ? this._templateName + ' - Copy'
                    : this._templateName)
                .catch(err => console.error(err))
        }
    }

    @internalProperty()
    private showNameInput = false

    @internalProperty()
    private internalTemplateName?: string

    render() {
        return html`
            ${this.errorMessage ? html`<p class="error-message">${this.errorMessage || ''}</p>` : html``}
            ${this.templateName ? html`<p>${this.templateName}</p>` : html``}
            ${ this.templateId
                ? html`
                    <rf-button
                        ?disabled=${this.showNameInput}
                        @click=${this.onSaveClick}
                        title="Save options template">
                        <rf-icon icon=${Icon.Floppy}></rf-icon>
                    </rf-button>`
                : html`` }
            <rf-button
                ?disabled=${this.showNameInput}
                @click=${this.onSaveAsClick}
                title="Save as new options template">
                <rf-icon icon=${Icon.AddTemplate}></rf-icon>
            </rf-button>
            ${this.showNameInput ? html`
            <div id="nameInputContainer">
                <rf-inside-container>
                    <label>Template Name</label>
                    <rf-input name="templateName"
                        type="text"
                        .value=${this.internalTemplateName}
                        maxLength=${100}
                        @form-field-change=${this.onNameChange}></rf-input>
                    <div>
                        <rf-button
                            size="small"
                            buttonRole="danger"
                            title="Cancel"
                            @click=${() => this.showNameInput = false}>
                            <rf-icon icon=${Icon.Cross}></rf-icon>
                        </rf-button>
                        <rf-button
                            size="small"
                            buttonRole="success"
                            title="Save"
                            ?disabled=${!this.internalTemplateName}
                            @click=${this.onConfirmCreate}>
                            <rf-icon icon=${Icon.Check}></rf-icon>
                        </rf-button>
                    </div>
                </rf-inside-container>
            </div>
            ` : html``}
        `
    }

    private onSaveClick() {
        this.dispatchEvent(new CustomEvent('save-template'))
    }

    private onSaveAsClick() {
        this.showNameInput = true
    }

    private onNameChange(ev: FormFieldChangeEvent) {
        this.internalTemplateName = (ev?.value?.templateName as string | undefined)?.substr(0, 100)
    }

    private onConfirmCreate() {
        this.dispatchEvent(new CustomEvent<string>('save-as-template', { detail: this.internalTemplateName }))
        this.showNameInput = false
    }
}

import { BaseElement } from '../core/base-element'
import { css, html, property, queryAssignedNodes, TemplateResult } from 'lit-element'
import { FormElement } from './form.element'
import { Icon } from '../common/icon'
import { FormStatusEvent } from './form-status-event'
import { tabBackEventType } from './tab-back-event-type'
import { FormSubmitEvent } from './form-submit-event'
import { Injectable } from 'cewdi'

interface ButtonConfig {
    icon: Icon,
    role: 'primary' | 'success'
}

@Injectable()
export class FormTabElement<T extends { [key: string]: any}> extends BaseElement {
    static get styles() {
        return [
            super.styles,
            css`
                :host {
                    display: flex;
                    flex-flow: column nowrap;
                    justify-content: space-between;
                    align-items: center;
                }
                div {
                    display: flex;
                    flex-flow: row wrap;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: var(--small-padding);
                    width: 100%;
                }
                div rf-button:last-child {
                    margin-left: auto;
                }
            `
        ]
    }

    @queryAssignedNodes('form', true)
    formElements?: NodeListOf<FormElement<T>>

    @property({ attribute: false })
    submitButton: ButtonConfig = { icon: Icon.Check, role: 'success' }

    @property({ attribute: false })
    backButton?: ButtonConfig

    @property({ type: Boolean, attribute: true })
    valid = true

    private get formElement(): FormElement<T> | undefined {
        return Array.from(this.formElements || [])[0]
    }

    render() {
        return html`
            <slot name="form" @form-status=${this.onFormStatus}></slot>
            <div>
                ${this.getButtonTemplate(this.onBackClick, 'Back', this.backButton)}
                ${this.getButtonTemplate(this.onSubmitClick, 'Submit', this.submitButton, !this.valid)}
            </div>
            `
    }

    private getButtonTemplate(
        clickListener: Function,
        title: string,
        config?: ButtonConfig,
        disabled?: boolean): TemplateResult {
        if (!config) { return html`` }
        return html`
            <rf-button title="${title}" buttonRole="${config.role}" @click=${clickListener} ?disabled=${disabled}>
                <rf-icon icon="${config.icon}"></rf-icon>
            </rf-button>
        `
    }

    private onBackClick() {
        this.dispatchEvent(new CustomEvent(tabBackEventType))
    }

    private onSubmitClick() {
        if (this.formElement && this.valid) {
            const value = this.formElement.value
            if (value) {
                this.dispatchEvent(new FormSubmitEvent<T>({ value }))
            }
        }
    }

    private onFormStatus(ev: FormStatusEvent) {
        ev.stopPropagation()
        this.valid = ev.isValid
    }
}

import { BaseElement } from '../core/base-element'
import { css, html, property, queryAssignedNodes, TemplateResult } from 'lit-element'
import { FormElement } from './form.element'
import { Icon } from '../common/icon'
import { animationsStyles } from '../common/animations.styles'
import { FormStatusEvent } from './form-status-event'
import { tabBackEventType } from './tab-back-event-type'
import { FormSubmitEvent } from './form-submit-event'

interface ButtonConfig {
    icon: Icon,
    role: 'primary' | 'success'
}

export class FormTabElement<T extends { [key: string]: any}> extends BaseElement {
    static get styles() {
        return [
            super.styles,
            animationsStyles,
            css`
                :host {
                    display: flex;
                    flex-flow: column nowrap;
                    justify-content: space-between;
                    align-items: center;
                    animation: slideInFromRight var(--animation-duration) var(--easing);
                }
                div {
                    display: flex;
                    flex-flow: row wrap;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: var(--small-padding);
                }
            `
        ]
    }

    @queryAssignedNodes('form')
    formElement?: FormElement<T>

    @property()
    submitButton: ButtonConfig = { icon: Icon.Check, role: 'success' }

    @property()
    backButton?: ButtonConfig

    @property()
    valid = true

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

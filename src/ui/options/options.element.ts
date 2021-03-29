import { BaseElement } from '../core/base-element'
import { css, html, internalProperty, property } from 'lit-element'
import { headingsStyles } from '../common/headings.styles'
import { FormSubmitEvent } from './form-submit-event'
import { animationsStyles } from '../common/animations.styles'
import { Injectable } from 'cewdi'
import { ModuleName } from '../core/module-name'
import { Icon } from '../common/icon'
import { OptionsFormService } from '../../services/options-form-service'
import { OptionsForm } from '../../storage/options-form'
import { Router } from '../core/router'
import { StateMediatorService, StateSubscription, StateTopic } from '../../services/state'
import { SuccessResponse } from '../../common/success-response'

@Injectable()
export class OptionsElement extends BaseElement {
    static get styles() {
        return [
            super.styles,
            headingsStyles,
            animationsStyles,
            css`
                :host {
                    display: flex;
                    height: 100%;
                    width: 100%;
                    flex-flow: row nowrap;
                    justify-content: space-between;
                    align-items: stretch;
                }
                rf-container {
                    flex-grow: 0;
                    min-height: 80vh;
                    max-width: 100vw;
                }
                rf-router-outlet {
                    width: 100%;
                    max-width: 960px;
                }
                #optionsOutlet {
                    flex-grow: 1;
                }
                #optionsNav {
                    position: relative;
                    transition: transform var(--animation-duration) var(--easing);
                }
                rf-options-template {
                    position: absolute;
                    bottom: 0;
                }
                :host([navishidden]) #optionsNav {
                    position: absolute;
                    top: 80px;
                    left: 0;
                    transform: translateX(-100%);
                }
                #optionsNav #hideButton {
                    position: absolute;
                    top: 0;
                    right: 0;
                    transition: transform var(--animation-duration) var(--easing);
                }
                @media
                screen and (max-width: 768px) and (orientation: portrait),
                screen and (max-width: 1024px) and (orientation: landscape) {
                    #optionsNav {
                        position: absolute;
                        z-index: 1;
                        max-width: 90vw;
                    }
                    :host([navishidden]) #optionsNav #hideButton {
                        transform: translateX(100%);
                    }
                    rf-options-template {
                        position: relative;
                        margin: auto calc(-2 * var(--padding)) calc(-1 * var(--padding)) 0;
                    }
                }
            `
        ]
    }

    @property({ reflect: false })
    showConfirm = false

    @property({ reflect: true, type: Boolean })
    navIsHidden = false

    @internalProperty()
    private formIsSet = false

    @internalProperty()
    private templateInfo: { id: string, name: string } | undefined

    @internalProperty()
    private templateErrorMessage?: string

    private readonly routeSubscription: StateSubscription

    constructor(
        private readonly formService: OptionsFormService,
        private readonly router: Router,
        private readonly state: StateMediatorService) {
        super()

        this.addEventListener(FormSubmitEvent.eventType, this.onFormSubmitEvent.bind(this))
        this.routeSubscription = this.state.subscribe(StateTopic.RouteParams, async (params) => {
            if (!this.formIsSet) {
                if (params && params.params && params.params.templateId) {
                    this.templateInfo = await this.formService.setTemplate(params.params.templateId.toString())
                } else {
                    this.formService.reset()
                }
                this.formIsSet = true
            }
        })
    }

    disconnectedCallback() {
        this.routeSubscription && this.routeSubscription.unsubscribe()
        super.disconnectedCallback()
    }

    render() {
        return this.formIsSet ? html`
            <rf-container id="optionsNav">
                <rf-button
                    id="hideButton"
                    size="small"
                    @click=${() => this.navIsHidden = !this.navIsHidden}
                    title="${this.navIsHidden ? 'Show' : 'Hide'}">
                    <rf-icon icon=${this.navIsHidden ? Icon.RightArrow : Icon.LeftArrow }></rf-icon>
                </rf-button>
                <rf-options-nav></rf-options-nav>
                <rf-button @click=${() => this.showConfirm = true} title="Run" buttonRole="success" size="large">
                    <rf-icon icon=${Icon.Check}></rf-icon>
                </rf-button>
                <rf-options-template
                    templateId=${this.templateInfo?.id ?? ''}
                    templateName=${this.templateInfo?.name ?? ''}
                    errorMessage=${this.templateErrorMessage ?? ''}
                    @save-template=${this.onSaveTemplate}
                    @save-as-template=${this.onSaveAsTemplate}>
                </rf-options-template>
            </rf-container>
            <rf-container id="optionsOutlet">
                <rf-router-outlet moduleName="${ModuleName.Options}"></rf-router-outlet>
            </rf-container>
            <rf-popup ?show=${this.showConfirm}>
                <rf-run-confirm-form @cancel=${() => this.showConfirm = false} @form-submit=${this.onRunConfirmed}>
                </rf-run-confirm-form>
            </rf-popup>
        ` : html``
    }

    private onFormSubmitEvent(event: Event) {
        const submitEvent = event as FormSubmitEvent<any>
        const value = submitEvent.value
        const property = Object.keys(value)[0]
        if (property) {
            this.formService.update(property as keyof OptionsForm, value[property])
        }
    }

    private onRunConfirmed(event: FormSubmitEvent<{ numberOfGenerations: number }>) {
        event.stopImmediatePropagation()
        this.showConfirm = false
        this.formService.updateRunParams(event.value.numberOfGenerations)
        this.router.navigate('/run')
    }

    private async onSaveTemplate() {
        if (this.templateInfo) {
            const result = await this.formService.saveTemplate(this.templateInfo.name)
            this.handleTemplateSaveResult(result)
        }
    }

    private async onSaveAsTemplate(ev: CustomEvent<string>) {
        const newTemplateName = ev?.detail ?? this.templateInfo?.name ?? 'New Template'
        const result = await this.formService.createTemplate(newTemplateName)
        this.handleTemplateSaveResult(result)
    }

    private handleTemplateSaveResult(result: SuccessResponse<{ id: string, name: string}>) {
        if (result.isSuccessful) {
            this.templateInfo = result.result
            this.templateErrorMessage = ''
        } else {
            this.templateErrorMessage = result.errorMessage
                || `Failed to save template ${this.templateInfo?.name ?? ''}`
        }
    }
}

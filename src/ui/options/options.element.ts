import { BaseElement } from '../core/base-element'
import { css, html, property } from 'lit-element'
import { headingsStyles } from '../common/headings.styles'
import { FormSubmitEvent } from './form-submit-event'
import { animationsStyles } from '../common/animations.styles'
import { Injectable } from 'cewdi'
import { ModuleName } from '../core/module-name'
import { Icon } from '../common/icon'
import { OptionsFormService } from '../../services/options-form-service'
import { OptionsForm } from '../../services/options-form'

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
                :host([navishidden]) #optionsNav {
                    position: absolute;
                    top: 80px;
                    left: 0;
                    transform: translateX(-100%);
                }
                #optionsNav rf-button {
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
                    :host([navishidden]) #optionsNav rf-button {
                        transform: translateX(100%);
                    }
                }
            `
        ]
    }

    @property({ reflect: false })
    showConfirm = false

    @property({ reflect: true, type: Boolean })
    navIsHidden = false

    constructor(private readonly formService: OptionsFormService) {
        super()

        this.addEventListener(FormSubmitEvent.eventType, this.onFormSubmitEvent.bind(this))
        this.formService.reset()
    }

    render() {
        return html`
            <rf-container id="optionsNav">
                <rf-button size="small" @click=${() => this.navIsHidden = !this.navIsHidden}>
                    <rf-icon icon=${this.navIsHidden ? Icon.RightArrow : Icon.LeftArrow }></rf-icon>
                </rf-button>
                <rf-options-nav></rf-options-nav>
            </rf-container>
            <rf-container id="optionsOutlet">
                <rf-router-outlet moduleName="${ModuleName.Options}"></rf-router-outlet>
            </rf-container>
            <rf-popup ?show=${this.showConfirm}>
                <rf-run-confirm-form @cancel=${() => this.showConfirm = false} @form-submit=${this.onRunConfirmed}>
                </rf-run-confirm-form>
            </rf-popup>
        `
    }

    private onFormSubmitEvent(event: Event) {
        const submitEvent = event as FormSubmitEvent<any>
        const value = submitEvent.value
        const property = Object.keys(value)[0]
        if (property) {
            this.formService.update(property as keyof OptionsForm, value[property])
        }
    }

    private onRunConfirmed(
        { value: { numberOfGenerations } }: FormSubmitEvent<{ numberOfGenerations: number }>) {
        this.showConfirm = false
        this.formService.run(numberOfGenerations)
    }
}

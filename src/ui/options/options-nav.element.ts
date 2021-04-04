import { Injectable } from 'cewdi'
import { css, html, internalProperty } from 'lit-element'
import { StateMediatorService, StateSubscription, StateTopic } from '../../services/state'
import { BaseElement } from '../core/base-element'
import { optionsRoutes } from './options-routes'

@Injectable()
export class OptionsNavElement extends BaseElement {
    static get styles() {
        return [
            super.styles,
            css`
                li {
                    padding: var(--small-padding);
                    border-radius: var(--border-radius);
                    transition: background-color var(--animation-duration) var(--easing);
                }
                li a {
                    transition: color var(--animation-duration) var(--easing);
                }
                li a:hover {
                    color: var(--medium-primary-color);
                }
                li[data-active] {
                    background-color: var(--light-primary-color);
                }
            `
        ]
    }

    @internalProperty()
    private activeSection = ''

    @internalProperty()
    private templateId: string | undefined

    private readonly routes: { label: string, href: string }[] = optionsRoutes
        .map(({ path, label }) => ({ label, href: `/options/${path}` }))

    private readonly subscription: StateSubscription

    constructor(private readonly state: StateMediatorService) {
        super()

        this.subscription = this.state
            .subscribe(
                StateTopic.RouteParams,
                ({ params }) => {
                    this.activeSection = params?.sub?.toString() ?? ''
                    this.templateId = params?.templateId?.toString()
                }
            )
    }

    disconnectedCallback() {
        this.subscription && this.subscription.unsubscribe()
        super.disconnectedCallback()
    }

    render() {
        return html`
            <nav>
                <ul>
                    ${this.routes.map(({ label, href }) =>
                        html`
                        <li ?data-active=${href.endsWith(this.activeSection)}>
                            <a href="${href + (this.templateId ? '/' + this.templateId : '')}">
                                ${label}
                            </a>
                        </li>`)}
                </ul>
            </nav>
        `
    }
}

import { Injectable } from 'cewdi'
import { css, html, internalProperty } from 'lit-element'
import { StateMediatorService, StateSubscription, StateTopic } from '../../services/state'
import { BaseElement } from '../core/base-element'

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
    activeSection = ''

    private readonly routes: { label: string, href: string }[] = [
        { href: '/options/size', label: 'Size and Time' },
        { href: '/options/chord', label: 'Chords' },
        { href: '/options/scale', label: 'Scale' },
        { href: '/options/pitch-sequence-direction', label: 'Pitch Sequences' },
        { href: '/options/rest-proportion', label: 'Rest Proportion' },
        { href: '/options/rhythmic-dispersion', label: 'Rhythmic Dispersion' },
        { href: '/options/patterns', label: 'Pitch Patterns' }
    ]

    private readonly subscription: StateSubscription

    constructor(private readonly state: StateMediatorService) {
        super()

        this.subscription = this.state
            .subscribe(
                StateTopic.RouteParams,
                ({ params }) => {
                    this.activeSection = params?.sub?.toString() ?? ''
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
                            <a href="${href}">${label}</a>
                        </li>`)}
                </ul>
            </nav>
        `
    }
}

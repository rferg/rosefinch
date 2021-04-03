import { BaseElement } from '../core/base-element'
import { css, html, property } from 'lit-element'
import { Icon } from '../common/icon'
import { headingsStyles } from '../common/headings.styles'
import { Injectable } from 'cewdi'
import { SummaryQueryService } from '../../services/summary-query-service'
import { GeneticAlgorithmSummaryStore } from '../../storage'
import { scrollbarStyles } from '../common/scrollbar.styles'
import { animationsStyles } from '../common/animations.styles'
import { linkLikeButtonStyles } from '../common/link-like-button.styles'
import { OptionsTemplateService, OptionsTemplateSummary } from '../../services/options-template.service'

@Injectable()
export class NewSessionElement extends BaseElement {
    static get styles() {
        return [
            super.styles,
            headingsStyles,
            scrollbarStyles,
            animationsStyles,
            linkLikeButtonStyles,
            css`
                :host {
                    display: flex;
                    height: 100%;
                    width: 100%;
                    justify-content: center;
                    align-items: center;
                }
                rf-container {
                    flex-grow: 0;
                    width: 960px;
                    max-width: 100vw;
                }
                rf-inside-container {
                    flex-grow: 1;
                    width: 100%;
                    justify-content: space-around;
                }
                rf-inside-container > * {
                    margin: 1rem;
                }
                button.link-like-button {
                    margin-left: auto;
                }
                .new-container {
                    margin-bottom: var(--padding);
                }
                h2 {
                    width: 100%;
                    text-align: left;
                }
                a.item-link h3 {
                    text-decoration: underline;
                }
                a.item-link h3 {
                    transition: color var(--animation-duration) var(--easing);
                }
                a.item-link:hover h3 {
                    color: var(--medium-primary-color);
                }
                .item {
                    flex-grow: 1;
                    width: auto;
                    display: flex;
                    flex-flow: column nowrap;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    animation: fadeIn var(--animation-duration) var(--easing);
                }
                .item h3, .item p {
                    margin: 0;
                }
                .item p {
                    font-size: var(--small-font-size);
                }
                .items-container {
                    padding: 0;
                    margin: 0;
                    width: 100%;
                    display: flex;
                    flex-flow: row wrap;
                    align-items: center;
                    justify-content: center;
                    max-height: 33vh;
                    overflow-y: auto;
                }
                @media screen and (max-width: 500px) {
                    .items-container {
                        max-height: 500px;
                    }
                }
            `
        ]
    }

    @property()
    summaries: GeneticAlgorithmSummaryStore[] = []

    @property()
    templates: OptionsTemplateSummary[] = []

    constructor(
        private readonly summaryService: SummaryQueryService,
        private readonly templateService: OptionsTemplateService) {
        super()

        this.summaryService.getRecent()
            .then(summaries => this.summaries = summaries || [])
            .catch(err => console.error(err))

        this.templateService.getRecent()
            .then(templates => this.templates = templates)
            .catch(err => console.error(err))
    }

    render() {
        return html`
        <rf-container>
            <rf-inside-container class="new-container">
                <a href="/options/size">
                    <rf-button buttonRole="${'success'}" title="Create a new session">
                        <rf-icon icon="${Icon.Plus}"></rf-icon>
                    </rf-button>
                </a>
                <h1 class="as-h3">New Session</h1>
            </rf-inside-container>
            ${this.templates.length
                ? html`
                    <h2 class="as-h5">Templates</h2>
                    <ul class="items-container">
                        ${this.templates.map(({ id, lastAccessedOn, name }) => html`
                            <li>
                                <rf-inside-container class="item template">
                                    <a title="Create new session using this template" class="item-link" href="/options/size/${id}">
                                        <h3 class="as-h5">${name}</h3>
                                    </a>
                                    <p>Last Accessed: ${this.formatDate(lastAccessedOn)}</p>
                                </rf-inside-container>
                            </li>
                        `)}
                    </ul>
                `
                : html``}
            ${this.summaries.length
                ? html`
                    <h2 class="as-h5">Past Sessions</h2>
                    <ul class="items-container">
                        ${this.summaries.map(({ id, lastRunOn, generation }) => html`
                            <li>
                                <rf-inside-container class="item summary">
                                    <a title="Open this session" class="item-link" href="/representatives/${id}">
                                        <h3 class="as-h5">Generation ${generation}</h3>
                                    </a>
                                    <p>Last Run: ${this.formatDate(lastRunOn)}</p>
                                </rf-inside-container>
                            </li>
                        `)}
                    </ul>
                `
                : html``}
        </rf-container>
        `
    }

    private formatDate(date: Date): string {
        if (!date) { return '- - -' }
        return date.toLocaleDateString(undefined, { hour: 'numeric', minute: 'numeric' })
    }
}

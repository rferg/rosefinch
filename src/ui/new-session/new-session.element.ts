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
                div {
                    display: flex;
                    flex-flow: column nowrap;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                }
                div h5, div p {
                    margin: 0;
                }
                button.link-like-button {
                    margin-left: auto;
                }
                .new-container {
                    margin-bottom: calc(var(--padding) * 2);
                }
                a.summary-link {
                    text-decoration: none;
                }
                a.summary-link h5, button {
                    transition: color var(--animation-duration) var(--easing);
                }
                a.summary-link:hover h5 {
                    color: var(--medium-primary-color);
                }
                .summary {
                    width: auto;
                    flex-direction: column;
                    animation: fadeIn var(--animation-duration) var(--easing);
                }
                .summaries-container {
                    padding: 0;
                    margin: 0;
                    width: 100%;
                    display: flex;
                    flex-flow: row wrap;
                    align-items: center;
                    justify-content: center;
                    max-height: 50vh;
                    overflow-y: auto;
                }
                @media screen and (max-width: 500px) {
                    .summaries-container {
                        max-height: 500px;
                    }
                }
            `
        ]
    }

    @property()
    summaries: GeneticAlgorithmSummaryStore[] = []

    @property()
    showMore = false

    private readonly summariesToShow = 3

    constructor(
        private readonly summaryService: SummaryQueryService) {
        super()

        this.summaryService.getRecent()
            .then(summaries => this.summaries = summaries || [])
            .catch(err => console.error(err))
    }

    render() {
        return html`
        <rf-container>
            <rf-inside-container class="new-container">
                <a href="/options">
                    <rf-button buttonRole="${'success'}" title="Create a new session">
                        <rf-icon icon="${Icon.Plus}"></rf-icon>
                    </rf-button>
                </a>
                <h3>New Session</h3>
            </rf-inside-container>
            <div class="summaries-container">
                ${this.summaries.slice(0, this.showMore ? undefined : this.summariesToShow)
                    .map(({ id, lastRunOn, generation }) => html`
                            <rf-inside-container class="summary">
                                <a title="Open this session" class="summary-link" href="/representatives/${id}">
                                    <h5>Generation ${generation}</h5>
                                </a>
                                <p>${this.formatDate(lastRunOn)}</p>
                            </rf-inside-container>
                        `
                )}
            </div>
            ${this.summaries.length > this.summariesToShow
                ? html`
                    <button class="link-like-button" title="Show more past sessions" @click=${this.toggleMore}>
                        ${this.showMore ? 'Less' : 'More'}
                    </button>`
                : html``}
        </rf-container>
        `
    }

    private formatDate(date: Date): string {
        return date.toLocaleDateString(undefined, { hour: 'numeric', minute: 'numeric' })
    }

    private toggleMore() {
        this.showMore = !this.showMore
    }
}

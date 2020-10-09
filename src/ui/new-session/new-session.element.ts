import { BaseElement } from '../core/base-element'
import { css, html, property } from 'lit-element'
import { Icon } from '../common/icon'
import { headingsStyles } from '../common/headings.styles'
import { Injectable } from 'cewdi'
import { SummaryQueryService } from '../../services/summary-query-service'
import { Router } from '../core/router'
import { GeneticAlgorithmSummaryStore } from '../../storage'

@Injectable()
export class NewSessionElement extends BaseElement {
    static get styles() {
        return [
            super.styles,
            headingsStyles,
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
            `
        ]
    }

    @property()
    summaries: GeneticAlgorithmSummaryStore[] = []

    constructor(
        private readonly summaryService: SummaryQueryService,
        private readonly router: Router) {
        super()

        this.summaryService.getRecent(3)
            .then(summaries => this.summaries = summaries)
            .catch(err => console.error(err))
    }

    render() {
        return html`
        <rf-container>
            <rf-inside-container>
                <a href="/options">
                    <rf-button buttonRole="${'success'}" title="Create a new session">
                        <rf-icon icon="${Icon.Plus}"></rf-icon>
                    </rf-button>
                </a>
                <h3>New Session</h3>
            </rf-inside-container>
            ${this.summaries.map(({ id, lastRunOn, generation }) => {
                return html`
                    <rf-inside-container>
                        <rf-button
                            buttonRole="${'primary'}"
                            title="Go to this session"
                            @click=${() => this.onSummaryClick(id)}>
                            <rf-icon icon="${Icon.Check}"></rf-icon>
                        </rf-button>
                        <h5>Generation ${generation}</h5>
                        <h6>${this.formatDate(lastRunOn)}</h6>
                    </rf-inside-container>
                `
            })}
        </rf-container>
        `
    }

    private onSummaryClick(id: string) {
        this.router.navigate(`/representatives/${id}`)
    }

    private formatDate(date: Date): string {
        return date.toLocaleDateString()
    }
}

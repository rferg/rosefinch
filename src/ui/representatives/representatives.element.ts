import { Inject, Injectable } from 'cewdi'
import { css, html, internalProperty, TemplateResult } from 'lit-element'
import { assertUnreachable } from '../../common/assert-unreachable'
import { globalEventTargetToken } from '../../common/global-event-target-token'
import { SerializedGeneticAlgorithmOptions } from '../../genetic-algorithm'
import { RepresentativeGenesService } from '../../services/pipeline'
import {
    ExistingPipelineRunParams,
    StateMediatorService,
    StateSubscription,
    StateTopic,
    UpdateStateEvent
} from '../../services/state'
import { GeneticAlgorithmOptionsRepository, GeneticAlgorithmSummaryRepository } from '../../storage'
import { animationsStyles } from '../common/animations.styles'
import { headingsStyles } from '../common/headings.styles'
import { scrollbarStyles } from '../common/scrollbar.styles'
import { BaseElement } from '../core/base-element'
import { Router } from '../core/router'
import { FormSubmitEvent } from '../options/form-submit-event'

type PopupContent = 'playback' | 'fitness' | 'run' | ''

@Injectable()
export class RepresentativesElement extends BaseElement {
    static get styles() {
        return [
            super.styles,
            headingsStyles,
            animationsStyles,
            scrollbarStyles,
            css`
                :host {
                    width: 100%;
                    display: flex;
                    flex-flow: column nowrap;
                    justify-content: flex-start;
                    align-items: center;
                }
                :host > * {
                    flex-grow: 1;
                }
                div {
                    width: 100%;
                    display: flex;
                    flex-flow: row wrap;
                    justify-content: space-between;
                    align-items: center;
                }
                rf-container {
                    margin: var(--small-padding);
                }
                div rf-container:first-child {
                    flex-grow: 4
                }
                div rf-container:last-child {
                    flex-grow: 1;
                    max-height: 80vh;
                    overflow-y: auto;
                    max-width: 20vw;
                }
            `
        ]
    }

    private geneticAlgorithmId?: string

    private _genes?: (number[] | undefined)[]
    @internalProperty()
    private get genes(): (number[] | undefined)[] {
        return this._genes || []
    }
    private set genes(val: (number[] | undefined)[]) {
        if (val !== this._genes) {
            const oldVal = this._genes
            this._genes = val
            this.ratings = new Array<number>(this._genes?.length ?? 0)
            if (this._genes && this._genes.length) { this.activeGenomeIndex = 0 }
            // Lit-Element documentation recommends this way of calling requestUpdate():
            // https://lit-element.polymer-project.org/guide/properties#accessors
            // tslint:disable-next-line: no-floating-promises
            this.requestUpdate('genes', oldVal)
        }
    }

    private _ratings?: number[]
    @internalProperty()
    private get ratings(): number[] {
        return this._ratings || []
    }
    private set ratings(val: number[]) {
        if (val !== this._ratings) {
            const oldVal = this._ratings
            this._ratings = val
            // Lit-Element documentation recommends this way of calling requestUpdate():
            // https://lit-element.polymer-project.org/guide/properties#accessors
            // tslint:disable-next-line: no-floating-promises
            this.requestUpdate('ratings', oldVal)
            this.eventTarget.dispatchEvent(new UpdateStateEvent(
                StateTopic.UserRatings,
                { userRepresentativeRatings: this._ratings }
            ))
        }
    }

    @internalProperty()
    private inPopup: PopupContent = ''

    @internalProperty()
    private activeGenomeIndex?: number

    @internalProperty()
    private options?: SerializedGeneticAlgorithmOptions

    @internalProperty()
    private generation?: number

    private readonly routeParamsSub: StateSubscription
    private representativeGenesSub?: StateSubscription
    private optionsSub?: StateSubscription

    constructor(
        private readonly state: StateMediatorService,
        private readonly router: Router,
        private readonly genesService: RepresentativeGenesService,
        private readonly optionsRepo: GeneticAlgorithmOptionsRepository,
        private readonly summaryRepo: GeneticAlgorithmSummaryRepository,
        @Inject(globalEventTargetToken) private readonly eventTarget: EventTarget) {
        super()
        this.routeParamsSub = this.state.subscribe(StateTopic.RouteParams, state => this.onRouteParams(state))
    }

    disconnectedCallback() {
        if (this.routeParamsSub) { this.routeParamsSub.unsubscribe() }
        if (this.representativeGenesSub) { this.representativeGenesSub.unsubscribe() }
        if (this.optionsSub) { this.optionsSub.unsubscribe() }
    }

    render() {
        return html`
            <rf-representatives-header
                .generation=${this.generation}
                @show-popup=${this.showPopupHandler}>
            </rf-representatives-header>
            <div>
                <rf-container>
                    <rf-edit-representative
                        .genome=${this.genes[this.activeGenomeIndex || 0]}
                        .rating=${this.ratings[this.activeGenomeIndex || 0]}
                        @rating-change=${this.onRatingChange}>
                    </rf-edit-representative>
                </rf-container>
                <rf-container>
                    ${(this.genes || [])
                        .map((genome, i) => genome
                            ? html`<rf-representative
                                        index="${i}"
                                        ?active=${i === this.activeGenomeIndex}
                                        .genome=${genome}
                                        .rating=${(this.ratings || [])[i]}
                                        @click=${() => this.activeGenomeIndex = i}>
                                    </rf-representative>`
                                : html``)}
                </rf-container>
            </div>
            <rf-popup ?show=${!!this.inPopup}>
                ${this.getPopupContent()}
            </rf-popup>
        `
    }

    private onRouteParams({ params: { id } }: { params: { [key: string]: any }}) {
        this.geneticAlgorithmId = id as string
        if (this.geneticAlgorithmId) {
            this.representativeGenesSub = this.state.subscribe(
                StateTopic.RepresentativeGenes,
                ({ representativeGenes, generation }) => {
                    this.genes = representativeGenes
                    this.generation = generation
                },
                {
                    onNotImmediatelyAvailable: async () => {
                        this.genes = await this.genesService.getGenes(this.geneticAlgorithmId || '')
                        this.generation = (await this.summaryRepo.get(this.geneticAlgorithmId || ''))?.generation ?? 0
                        this.eventTarget.dispatchEvent(new UpdateStateEvent(
                            StateTopic.RepresentativeGenes,
                            { representativeGenes: [ ...(this.genes || []) ], generation: this.generation }
                        ))
                    }
                }
            )

            this.optionsSub = this.state.subscribe(
                StateTopic.GeneticAlgorithmOptions,
                (options) => {
                    this.options = options
                },
                {
                    onNotImmediatelyAvailable: async () => {
                        const options = await this.optionsRepo.get(this.geneticAlgorithmId || '')
                        if (options) {
                            this.options = options
                            this.eventTarget.dispatchEvent(new UpdateStateEvent(
                                StateTopic.GeneticAlgorithmOptions,
                                { ...options }
                            ))
                        }
                    }
                }
            )
        }
    }

    private showPopupHandler({ detail: popupContent }: CustomEvent<PopupContent>) {
        const validValues: PopupContent[] = [ 'fitness', 'playback', 'run', '' ]
        if (validValues.indexOf(popupContent) === -1) {
            this.inPopup = ''
        } else {
            this.inPopup = popupContent
        }
    }

    private getPopupContent(): TemplateResult {
        switch (this.inPopup) {
            case 'fitness':
                return html`
                    <rf-representatives-fitness-form .options=${this.options}>
                    </rf-representatives-fitness-form>`
            case 'playback':
                return html`<rf-playback-options></rf-playback-options>`
            case 'run':
                return html`
                    <rf-run-confirm-form @cancel=${() => this.inPopup = ''} @form-submit=${this.onRunConfirmed}>
                    </rf-run-confirm-form>`
            case '':
                return html``
            default:
                assertUnreachable(this.inPopup, 'Invalid show in popup content')
        }
    }

    private onRunConfirmed({ value: { numberOfGenerations } }: FormSubmitEvent<{ numberOfGenerations: number }>) {
        if (this.geneticAlgorithmId) {
            const params: ExistingPipelineRunParams = {
                geneticAlgorithmId: this.geneticAlgorithmId,
                numberOfGenerations
            }
            this.eventTarget.dispatchEvent(new UpdateStateEvent(StateTopic.PipelineRunParams, params))
            this.router.navigate('/run')
        }
    }

    private onRatingChange({ detail: rating }: CustomEvent<number>) {
        if (this.ratings && this.activeGenomeIndex !== undefined) {
            this.ratings = Object.assign([], this.ratings, { [this.activeGenomeIndex]: rating })
        }
    }
}

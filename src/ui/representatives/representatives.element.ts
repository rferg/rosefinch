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
import { GeneticAlgorithmOptionsRepository } from '../../storage'
import { animationsStyles } from '../common/animations.styles'
import { headingsStyles } from '../common/headings.styles'
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
            css``
        ]
    }

    @internalProperty()
    private geneticAlgorithmId?: string

    private _genes?: (number[] | undefined)[]
    @internalProperty()
    get genes(): (number[] | undefined)[] {
        return this._genes || []
    }
    set genes(val: (number[] | undefined)[]) {
        if (val !== this._genes) {
            const oldVal = this._genes
            this._genes = val
            this.ratings = new Array<number>(this._genes?.length ?? 0)
            if (this._genes && this._genes.length) { this.activeGeneIndex = 0 }
            // tslint:disable-next-line: no-floating-promises
            this.requestUpdate('genes', oldVal)
        }
    }

    @internalProperty()
    private ratings?: number[]

    @internalProperty()
    private inPopup: PopupContent = ''

    @internalProperty()
    private activeGeneIndex?: number

    @internalProperty()
    private options?: SerializedGeneticAlgorithmOptions

    private readonly routeParamsSub: StateSubscription
    private representativeGenesSub?: StateSubscription
    private optionsSub?: StateSubscription

    constructor(
        private readonly state: StateMediatorService,
        private readonly router: Router,
        private readonly genesService: RepresentativeGenesService,
        private readonly optionsRepo: GeneticAlgorithmOptionsRepository,
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
                .options=${this.options}
                @show-popup=${(ev: CustomEvent<PopupContent>) => this.inPopup = ev.detail || ''}>
            </rf-representatives-header>
            <div>
                <rf-container>
                    <rf-edit-representative
                        .genome=${this.genes[this.activeGeneIndex || 0]}
                        @rating-change=${this.onRatingChange}>
                    </rf-edit-representative>
                </rf-container>
                <rf-container>
                    ${(this.genes || [])
                        .map((genome, i) => genome
                            ? html`<rf-representative
                                        index="${i}"
                                        .genome=${genome}
                                        .rating=${(this.ratings || [])[i]}
                                        @click=${() => this.activeGeneIndex = i}>
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
                ({ representativeGenes }) => {
                    this.genes = representativeGenes
                },
                {
                    onNotImmediatelyAvailable: async () => {
                        this.genes = await this.genesService.getGenes(this.geneticAlgorithmId || '')
                        this.eventTarget.dispatchEvent(new UpdateStateEvent(
                            StateTopic.RepresentativeGenes,
                            { representativeGenes: [ ...(this.genes || []) ] }
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

    private getPopupContent(): TemplateResult {
        switch (this.inPopup) {
            case 'fitness':
                return html`<rf-fitness-form></rf-fitness-form>`
            case 'playback':
                return html`<rf-playback-options></rf-playback-options>`
            case 'run':
                return html`
                    <rf-run-confirm-form @cancel=${() => this.inPopup = ''} @form-submit=${this.onRunConfirmed}>
                    </rf-run-confirm-form>`
            case '':
                return html``
            default:
                assertUnreachable(this.inPopup, 'Invalid showInPopup value.')
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
        if (this.ratings && this.activeGeneIndex !== undefined) {
            this.ratings = Object.assign([], this.ratings, { [this.activeGeneIndex]: rating })
        }
    }
}

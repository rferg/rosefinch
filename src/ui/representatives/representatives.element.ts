import { Inject, Injectable } from 'cewdi'
import { css, html, internalProperty, TemplateResult } from 'lit-element'
import { assertUnreachable } from '../../common/assert-unreachable'
import { globalEventTargetToken } from '../../common/global-event-target-token'
import { SerializedGeneticAlgorithmOptions } from '../../genetic-algorithm'
import { RepresentativeGenesService } from '../../services/pipeline'
import { Instrument, PlaybackControls, PlaybackOptions, PlaybackService } from '../../services/playback'
import {
    ExistingPipelineRunParams,
    RepresentativeGenesState,
    StateMediatorService,
    StateSubscription,
    StateTopic,
    UpdateStateEvent
} from '../../services/state'
import { GeneticAlgorithmOptionsRepository, GeneticAlgorithmOptionsStore, GeneticAlgorithmSummaryRepository } from '../../storage'
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
                #notation {
                    width: 100%;
                    display: block;
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

    @internalProperty()
    private ratings: number[] = []

    @internalProperty()
    private inPopup: PopupContent = ''

    private _activeGenomeIndex?: number
    @internalProperty()
    private get activeGenomeIndex(): number {
        return this._activeGenomeIndex || 0
    }
    private set activeGenomeIndex(val: number) {
        if (val !== this._activeGenomeIndex) {
            const oldVal = this._activeGenomeIndex
            this._activeGenomeIndex = val
            this.onPause()
            // Lit-Element documentation recommends this way of calling requestUpdate():
            // https://lit-element.polymer-project.org/guide/properties#accessors
            // tslint:disable-next-line: no-floating-promises
            this.requestUpdate('activeGenomeIndex', oldVal)
        }
    }

    @internalProperty()
    private options?: SerializedGeneticAlgorithmOptions

    @internalProperty()
    private generation?: number

    @internalProperty()
    private isPlaying = false

    @internalProperty()
    private playbackOptions: PlaybackOptions = { bpm: 120, instrument: Instrument.Piano }

    private readonly routeParamsSub: StateSubscription
    private representativeGenesSub?: StateSubscription
    private optionsSub?: StateSubscription
    private activePlaybackControls?: { genomeIndex: number, controls: PlaybackControls }

    constructor(
        private readonly state: StateMediatorService,
        private readonly router: Router,
        private readonly genesService: RepresentativeGenesService,
        private readonly optionsRepo: GeneticAlgorithmOptionsRepository,
        private readonly summaryRepo: GeneticAlgorithmSummaryRepository,
        @Inject(globalEventTargetToken) private readonly eventTarget: EventTarget,
        private readonly playback: PlaybackService) {
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
                        .genome=${this.genes[this.activeGenomeIndex]}
                        .rating=${this.ratings[this.activeGenomeIndex]}
                        ?playing=${this.isPlaying}
                        @rating-change=${this.onRatingChange}
                        @play=${this.onPlay}
                        @pause=${this.onPause}>
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
                    ifNotMatch: {
                        matcher: state =>
                            (state as RepresentativeGenesState)?.geneticAlgorithmId === this.geneticAlgorithmId,
                        action: async () => {
                            this.genes = await this.genesService.getGenes(this.geneticAlgorithmId || '')
                            this.generation = (await this.summaryRepo.get(this.geneticAlgorithmId || ''))
                                ?.generation ?? 0
                            this.eventTarget.dispatchEvent(new UpdateStateEvent(
                                StateTopic.RepresentativeGenes,
                                {
                                    representativeGenes: [ ...(this.genes || []) ],
                                    generation: this.generation,
                                    geneticAlgorithmId: this.geneticAlgorithmId || ''
                                }
                            ))
                        }
                    }
                }
            )

            this.optionsSub = this.state.subscribe(
                StateTopic.GeneticAlgorithmOptions,
                (options) => {
                    this.options = options
                },
                {
                    ifNotMatch: {
                        matcher: state =>
                            (state as GeneticAlgorithmOptionsStore)?.id === this.geneticAlgorithmId,
                        action: async () => {
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
                }
            )
        }
    }

    private showPopupHandler({ detail: popupContent }: CustomEvent<PopupContent>) {
        const validValues: PopupContent[] = [ 'fitness', 'playback', 'run', '' ]
        // Pause any current playback.
        this.onPause()
        if (validValues.indexOf(popupContent) === -1) {
            this.closePopup()
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
                return html`
                    <rf-playback-options
                        .options=${this.playbackOptions}
                        @form-submit=${this.onPlaybackOptionsChange}
                        @cancel=${this.closePopup}>
                    </rf-playback-options>`
            case 'run':
                return html`
                    <rf-run-confirm-form
                        @cancel=${this.closePopup}
                        @form-submit=${this.onRunConfirmed}>
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
                numberOfGenerations,
                userRepresentativeRatings: this.ratings
            }
            this.eventTarget.dispatchEvent(new UpdateStateEvent(StateTopic.PipelineRunParams, params))
            this.router.navigate('/run')
        }
    }

    private onRatingChange({ detail: rating }: CustomEvent<number>) {
        if (this.ratings) {
            this.ratings = Object.assign([], this.ratings, { [this.activeGenomeIndex]: rating })
        }
    }

    private async onPlay(): Promise<void> {
        if (this.activePlaybackControls?.genomeIndex !== this.activeGenomeIndex) {
            const controls = await this.playback.setupSequence({
                genes: this.genes[this.activeGenomeIndex] || [],
                shortestNoteDuration: this.options?.shortestNoteDuration ?? 1,
                options: this.playbackOptions,
                callbacks: {
                    onNoteChange: (_, __, isDone) => {
                        this.isPlaying = !isDone
                    }
                }
            })
            this.activePlaybackControls = { genomeIndex: this.activeGenomeIndex, controls }
        }
        this.activePlaybackControls?.controls.play()
    }

    private onPause() {
        this.activePlaybackControls?.controls.pause()
        this.isPlaying = false
    }

    private onPlaybackOptionsChange(event: FormSubmitEvent<PlaybackOptions>) {
        event.stopPropagation()
        if (event?.value) {
            this.playbackOptions = { ...event.value }
            // Reset any existing playback part so that
            // new options are applied.
            this.activePlaybackControls = undefined
            this.closePopup()
        }
    }

    private closePopup() {
        this.inPopup = ''
    }
}

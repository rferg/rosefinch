import { Injectable } from 'cewdi'
import { css, html, internalProperty } from 'lit-element'
import { RepresentativeGenesService } from '../../services/pipeline'
import { StateMediatorService, StateSubscription, StateTopic } from '../../services/state'
import { animationsStyles } from '../common/animations.styles'
import { headingsStyles } from '../common/headings.styles'
import { BaseElement } from '../core/base-element'

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

    @internalProperty()
    private genes?: number[][]

    private readonly routeParamsSub: StateSubscription
    private representativeGenesSub?: StateSubscription

    constructor(
        private readonly state: StateMediatorService,
        private readonly genesService: RepresentativeGenesService) {
        super()
        this.routeParamsSub = this.state.subscribe(StateTopic.RouteParams, state => this.onRouteParams(state))
    }

    disconnectedCallback() {
        if (this.routeParamsSub) { this.routeParamsSub.unsubscribe() }
        if (this.representativeGenesSub) { this.representativeGenesSub.unsubscribe() }
    }

    render() {
        return html`<h1>Hello Representatives! Id: ${this.geneticAlgorithmId}</h1>`
    }

    private onRouteParams({ params: { id } }: { params: { [key: string]: any }}) {
        this.geneticAlgorithmId = id as string
        if (this.geneticAlgorithmId) {
            this.representativeGenesSub = this.state.subscribe(
                StateTopic.RepresentativeGenes,
                ({ representativeGenes }) => {
                    this.genes = this.filterOutUndefinedRepresentatives(representativeGenes)
                },
                {
                    onNotImmediatelyAvailable: async () => {
                        this.genes = this.filterOutUndefinedRepresentatives(
                            await this.genesService.getGenes(this.geneticAlgorithmId || ''))
                        console.log(this.genes)
                    }
                }
            )
        }
        console.log(this.genes)
    }

    private filterOutUndefinedRepresentatives(genes: (number[] | undefined)[]): number[][] {
        return genes.filter((genes): genes is number[] => {
            return genes !== undefined
        })
    }
}

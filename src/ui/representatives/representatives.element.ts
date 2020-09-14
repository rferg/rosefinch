import { Injectable } from 'cewdi'
import { css, html, internalProperty } from 'lit-element'
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
    private readonly representativeGenesSub: StateSubscription

    constructor(private readonly state: StateMediatorService) {
        super()
        this.routeParamsSub = this.state.subscribe(
            StateTopic.RouteParams,
            ({ params: { id } }) => this.geneticAlgorithmId = id as string)
        this.representativeGenesSub = this.state.subscribe(
            StateTopic.RepresentativeGenes,
            ({ representativeGenes }) => {
                this.genes = representativeGenes.filter((genes): genes is number[] => {
                    return genes !== undefined
                })
                console.log(this.genes)
            }
        )
    }

    disconnectedCallback() {
        if (this.routeParamsSub) { this.routeParamsSub.unsubscribe() }
        if (this.representativeGenesSub) { this.representativeGenesSub.unsubscribe() }
    }

    render() {
        return html`<h1>Hello Representatives! Id: ${this.geneticAlgorithmId}</h1>`
    }
}

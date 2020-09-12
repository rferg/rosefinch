import { Inject, Injectable } from 'cewdi'
import { css, html, property } from 'lit-element'
import { ClusterProgressMessage, ClusterWorkerMessageType } from '../../clustering'
import { globalEventTargetToken } from '../../common/global-event-target-token'
import { GeneticAlgorithmWorkerMessageType, ProgressMessage } from '../../genetic-algorithm'
import { GeneticAlgorithmService, PipelineError, PipelineState } from '../../services/pipeline'
import { CancelPipelineEvent } from '../../services/pipeline/cancel-pipeline-event'
import { ClusterConfigProvider } from '../../services/pipeline/cluster-config-provider'
import { PipelineProgressEvent } from '../../services/pipeline/pipeline-progress-event'
import { pipelineProgressEventType } from '../../services/pipeline/pipeline-progress-event-type'
import {
    ExistingPipelineRunParams,
    NewPipelineRunParams,
    PipelineRunParams,
    StateMediatorService,
    StateSubscription,
    StateTopic
} from '../../services/state'
import { animationsStyles } from '../common/animations.styles'
import { headingsStyles } from '../common/headings.styles'
import { Icon } from '../common/icon'
import { BaseElement } from '../core/base-element'

@Injectable()
export class PipelineElement extends BaseElement {
    static get styles() {
        return [
            super.styles,
            headingsStyles,
            animationsStyles,
            css``
        ]
    }

    @property({ reflect: true, type: Boolean })
    isRunning = false

    @property({ reflect: true, type: Boolean })
    isCanceling = false

    @property({ reflect: false })
    progressMessage = ''

    @property({ reflect: false })
    progressPercentage = 0

    private readonly paramsSubscription: StateSubscription
    private readonly maxClusterIterations: number

    constructor(
        private readonly state: StateMediatorService,
        private readonly ga: GeneticAlgorithmService,
        private readonly clusterConfig: ClusterConfigProvider,
        @Inject(globalEventTargetToken) private readonly eventTarget: EventTarget) {
        super()
        this.paramHandler = this.paramHandler.bind(this)
        this.pipelineProgressHandler = this.pipelineProgressHandler.bind(this)
        this.paramsSubscription = this.state.subscribe(StateTopic.PipelineRunParams, this.paramHandler)
        this.eventTarget.addEventListener(pipelineProgressEventType, this.pipelineProgressHandler)
        this.maxClusterIterations = this.clusterConfig.getConfig().maxIterations
    }

    disconnectedCallback() {
        if (this.paramsSubscription) { this.paramsSubscription.unsubscribe() }
        this.eventTarget.removeEventListener(pipelineProgressEventType, this.pipelineProgressHandler)
    }

    render() {
        return html`
            <rf-popup ?show=${true}>
                <h1>${
                    this.isRunning ? 'Running...' : (this.isCanceling ? 'Canceling...' : '')
                }</h1>
                <p>${this.progressMessage}</p>
                <p>${this.progressPercentage}%</p>
                <rf-button buttonRole="danger" @click=${this.cancel} ?disabled=${!this.isRunning}>
                    <rf-icon icon=${Icon.Cross}></rf-icon>
                </rf-button>
            </rf-popup>`
    }

    private async paramHandler(params: PipelineRunParams): Promise<void> {
        if (this.isNewParams(params)) {
            this.isRunning = true
            this.handleResult(await this.ga.createAndRun(params))
        } else if (this.isExistingParams(params)) {
            this.isRunning = true
            this.handleResult(await this.ga.run(params))
        } else {
            this.handleBadParams(params)
        }
    }

    private pipelineProgressHandler(ev: Event) {
        if (this.isPipelineProgressEvent(ev)) {
            ev.stopPropagation()
            const { report: { detail } } = ev
            if (this.isClusterProgressMessage(detail)) {
                console.log(detail.iteration, this.maxClusterIterations)
                this.progressMessage = 'Clustering population...'
                this.progressPercentage = Math.floor((detail.iteration / this.maxClusterIterations) * 100)
            } else if (this.isGAProgressMessage(detail)) {
                this.progressMessage = 'Running genetic algorithm...'
                this.progressPercentage = detail.percentComplete
            } else {
                this.progressMessage = detail.message
            }
        }
    }

    private cancel() {
        this.isRunning = false
        this.isCanceling = true
        this.eventTarget.dispatchEvent(new CancelPipelineEvent())
    }

    private handleResult(result: {
        geneticAlgorithmId: string
        generation?: number
        error?: PipelineError<PipelineState> | Error
        isCanceled: boolean
    }) {
        this.isRunning = false
        this.isCanceling = false
        this.progressMessage = 'Done!'
        console.log(result)
    }

    private isNewParams(params: PipelineRunParams): params is NewPipelineRunParams {
        return !!(params as NewPipelineRunParams)?.size
    }

    private isExistingParams(params: PipelineRunParams): params is ExistingPipelineRunParams {
        return !!(params as ExistingPipelineRunParams)?.geneticAlgorithmId
    }

    private handleBadParams(params: any): void {
        console.error(params)
    }

    private isPipelineProgressEvent(ev: Event): ev is PipelineProgressEvent {
        return !!(ev as PipelineProgressEvent)?.report
    }

    private isGAProgressMessage(detail: any): detail is ProgressMessage {
        return (detail as ProgressMessage)?.type === GeneticAlgorithmWorkerMessageType.Progress
            && !!(detail as ProgressMessage)?.percentComplete
    }

    private isClusterProgressMessage(detail: any): detail is ClusterProgressMessage {
        return (detail as ClusterProgressMessage)?.type === ClusterWorkerMessageType.Progress
            && !!(detail as ClusterProgressMessage)?.iteration
    }
}

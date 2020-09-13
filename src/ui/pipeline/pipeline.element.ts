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
            css`
                section {
                    display: flex;
                    flex-flow: column nowrap;
                    justify-content: center;
                    align-items: center;
                    text-align: center;
                    padding: var(--padding);
                    min-width: 300px;
                }
                rf-button {
                    margin-top: var(--padding);
                }
                h1, p {
                    color: var(--inverse-font-color);
                }
            `
        ]
    }

    @property({ reflect: true, type: Boolean })
    isRunning = false

    @property({ reflect: true, type: Boolean })
    isCanceling = false

    @property({ reflect: false })
    message = ''

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
                <section>
                    <h1>${
                        this.isRunning ? 'Running...' : (this.isCanceling ? 'Canceling...' : 'Done!')
                    }</h1>
                    <p>${this.message}</p>
                    <rf-progress-bar percentage="${this.progressPercentage}"></rf-progress-bar>
                    <rf-button buttonRole="danger" @click=${this.cancel} ?disabled=${!this.isRunning}>
                        <rf-icon icon=${Icon.Cross}></rf-icon>
                    </rf-button>
                </section>
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
                this.message = 'Clustering population...'
                this.progressPercentage = Math.floor((detail.iteration / this.maxClusterIterations) * 100)
            } else if (this.isGAProgressMessage(detail)) {
                this.message = 'Running genetic algorithm...'
                this.progressPercentage = detail.percentComplete
            } else {
                this.message = detail.message
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
        this.message = ''
        this.progressPercentage = 100
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

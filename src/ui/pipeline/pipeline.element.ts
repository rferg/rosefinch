import { Inject, Injectable } from 'cewdi'
import { css, html, internalProperty } from 'lit-element'
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
    StateTopic,
    UpdateStateEvent
} from '../../services/state'
import { headingsStyles } from '../common/headings.styles'
import { Icon } from '../common/icon'
import { BaseElement } from '../core/base-element'
import { Router } from '../core/router'
import { Timer } from '../core/timer'
import { timerToken } from '../core/timer-token'

enum PipelineStatus {
    None,
    Running,
    Canceling,
    Aborted,
    Succeeded
}

@Injectable()
export class PipelineElement extends BaseElement {
    static get styles() {
        return [
            super.styles,
            headingsStyles,
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

    @internalProperty()
    private progressPercentage = 0

    @internalProperty()
    private runState: PipelineStatus = PipelineStatus.None

    @internalProperty()
    private message = ''

    private get header(): string {
        switch (this.runState) {
            case PipelineStatus.Running:
                return 'Running...'
            case PipelineStatus.Canceling:
                return 'Canceling...'
            case PipelineStatus.Aborted:
                return 'Aborted'
            case PipelineStatus.Succeeded:
                return 'Complete'
            case PipelineStatus.None:
                return ''
            default:
                return ''
        }
    }

    private readonly paramsSubscription: StateSubscription
    private readonly maxClusterIterations: number
    private readonly paramsTimeoutDuration = 300
    private readonly paramsTimeoutId = this.timer.setTimeout(
        () => this.handleBadParams(`Did not receive params after ${this.paramsTimeoutDuration}ms.`),
        this.paramsTimeoutDuration)

    constructor(
        private readonly router: Router,
        private readonly state: StateMediatorService,
        private readonly ga: GeneticAlgorithmService,
        private readonly clusterConfig: ClusterConfigProvider,
        @Inject(globalEventTargetToken) private readonly eventTarget: EventTarget,
        @Inject(timerToken) private readonly timer: Timer) {
            super()
            this.paramHandler = this.paramHandler.bind(this)
            this.pipelineProgressHandler = this.pipelineProgressHandler.bind(this)
            this.paramsSubscription = this.state.subscribe(StateTopic.PipelineRunParams, this.paramHandler)
            this.eventTarget.addEventListener(pipelineProgressEventType, this.pipelineProgressHandler)
            this.maxClusterIterations = this.clusterConfig.getConfig()?.maxIterations ?? 100
    }

    disconnectedCallback() {
        if (this.paramsSubscription) { this.paramsSubscription.unsubscribe() }
        this.eventTarget.removeEventListener(pipelineProgressEventType, this.pipelineProgressHandler)
        this.timer.clearTimeout(this.paramsTimeoutId)
    }

    render() {
        return html`
            <rf-popup ?show=${true}>
                <section>
                    <h1>${this.header}</h1>
                    <p>${this.message}</p>
                    <rf-progress-bar percentage="${this.progressPercentage}"></rf-progress-bar>
                    ${
                        this.runState === PipelineStatus.Running
                        ? html`
                            <rf-button title="Cancel" buttonRole="danger" @click=${this.cancel}>
                                <rf-icon icon=${Icon.Cross}></rf-icon>
                            </rf-button>`
                        : html``
                    }
                    ${
                        this.runState === PipelineStatus.Aborted
                        ? html`
                            <rf-button title="Start Over" buttonRole="success" @click=${this.startOver}>
                                <rf-icon icon=${Icon.Plus}></rf-icon>
                            </rf-button>`
                        : html``
                    }
                </section>
            </rf-popup>`
    }

    private async paramHandler(params: PipelineRunParams): Promise<void> {
        this.timer.clearTimeout(this.paramsTimeoutId)
        if ((params as { cleared: true })?.cleared) {
            return this.router.navigate('/')
        }
        try {
            if (this.isNewParams(params)) {
                this.runState = PipelineStatus.Running
                this.handleResult(await this.ga.createAndRun(params))
            } else if (this.isExistingParams(params)) {
                this.runState = PipelineStatus.Running
                this.handleResult(await this.ga.run(params))
            } else {
                this.handleBadParams(params)
            }
        } catch (error) {
            this.onErredOrCanceled({ error, isCanceled: false })
        } finally {
            // Clear run params so pipeline does not run again if user navigates back to /run.
            this.eventTarget.dispatchEvent(
                new UpdateStateEvent(StateTopic.PipelineRunParams, { cleared: true }))
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
        this.runState = PipelineStatus.Canceling
        this.eventTarget.dispatchEvent(new CancelPipelineEvent())
    }

    private startOver() {
        this.router.navigate('/')
    }

    private handleResult({
        geneticAlgorithmId,
        error,
        isCanceled
    }: {
        geneticAlgorithmId: string
        generation?: number
        error?: PipelineError<PipelineState> | Error
        isCanceled: boolean
    }) {
        // Ensure that we do not receive any new run params.
        this.paramsSubscription?.unsubscribe()
        this.message = ''
        this.progressPercentage = 100
        if (!(error || isCanceled)) {
            this.runState = PipelineStatus.Succeeded
            this.router.navigate(`/representatives/${geneticAlgorithmId}`)
        } else {
            this.onErredOrCanceled({ error, isCanceled })
        }
    }

    private onErredOrCanceled({
        error,
        isCanceled
    }: {
        error?: PipelineError<PipelineState> | Error
        isCanceled: boolean
    }) {
        this.runState = PipelineStatus.Aborted
        const initialMessage = isCanceled ? 'Run canceled.' : 'Uh oh! Something went wrong.'
        this.message = `${initialMessage}  Click below to start a new session.`
        if (error) { console.error(error) }
    }

    private handleBadParams(params: any): void {
        this.onErredOrCanceled({ error: new Error(`Bad pipeline run params: ${params}`), isCanceled: false })
    }

    private isNewParams(params: PipelineRunParams): params is NewPipelineRunParams {
        return !!(params as NewPipelineRunParams)?.size
    }

    private isExistingParams(params: PipelineRunParams): params is ExistingPipelineRunParams {
        return !!(params as ExistingPipelineRunParams)?.geneticAlgorithmId
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

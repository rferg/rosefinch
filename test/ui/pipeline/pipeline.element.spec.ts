import { elementUpdated, fixture } from '@open-wc/testing-helpers'
import { html } from 'lit-element'
import { ClusterWorkerMessageType } from '../../../src/clustering'
import { GeneticAlgorithmWorkerMessageType } from '../../../src/genetic-algorithm'
import { GeneticAlgorithmService } from '../../../src/services/pipeline'
import { CancelPipelineEvent } from '../../../src/services/pipeline/cancel-pipeline-event'
import { ClusterConfigProvider } from '../../../src/services/pipeline/cluster-config-provider'
import { PipelineProgressEvent } from '../../../src/services/pipeline/pipeline-progress-event'
import { pipelineProgressEventType } from '../../../src/services/pipeline/pipeline-progress-event-type'
import { PipelineStageName } from '../../../src/services/pipeline/pipeline-stage-name'
import {
    ExistingPipelineRunParams,
    NewPipelineRunParams,
    PipelineRunParams,
    StateMediatorService,
    StateSubscription,
    StateTopic,
    UpdateStateEvent
} from '../../../src/services/state'
import { Router } from '../../../src/ui/core/router'
import { Timer } from '../../../src/ui/core/timer'
import { PipelineElement } from '../../../src/ui/pipeline/pipeline.element'
import { ButtonElementStub } from '../../helpers/button-element-stub'
import { CustomElementRegistrar } from '../../helpers/custom-element-registrar'
import { IconElementStub } from '../../helpers/icon-element-stub'
import { PopupElementStub } from '../../helpers/popup-element-stub'
import { ProgressBarElementStub } from '../../helpers/progress-bar-element-stub'

describe('PipelineElement', () => {
    let routerSpy: jasmine.SpyObj<Router>
    let stateSpy: jasmine.SpyObj<StateMediatorService>
    let gaSpy: jasmine.SpyObj<GeneticAlgorithmService>
    let clusterConfigSpy: jasmine.SpyObj<ClusterConfigProvider>
    let eventSpy: jasmine.SpyObj<EventTarget>
    let timerSpy: jasmine.SpyObj<Timer>
    let el: PipelineElement
    let stateSubscriptionSpy: jasmine.SpyObj<StateSubscription>

    const timeoutId = 1
    const clusterConfigMaxIterations = 120

    beforeAll(() => {
        routerSpy = jasmine.createSpyObj<Router>('Router', [ 'navigate' ])
        stateSpy = jasmine.createSpyObj<StateMediatorService>('StateMediatorService', [ 'subscribe' ])
        gaSpy = jasmine.createSpyObj<GeneticAlgorithmService>('GeneticAlgorithmService', [ 'createAndRun', 'run' ])
        clusterConfigSpy = jasmine.createSpyObj<ClusterConfigProvider>('ClusterConfigProvider', [ 'getConfig' ])
        eventSpy = jasmine.createSpyObj<EventTarget>(
            'EventTarget',
            [ 'addEventListener', 'dispatchEvent', 'removeEventListener' ])
        timerSpy = jasmine.createSpyObj<Timer>('Timer', [ 'setTimeout', 'clearTimeout' ])

        CustomElementRegistrar.instance.register(ProgressBarElementStub.is, ProgressBarElementStub)
        CustomElementRegistrar.instance.register(PopupElementStub.is, PopupElementStub)
        CustomElementRegistrar.instance.register(ButtonElementStub.is, ButtonElementStub)
        CustomElementRegistrar.instance.register(IconElementStub.is, IconElementStub)
        CustomElementRegistrar.instance.register('rf-pipeline-test', class extends PipelineElement {
            constructor() {
                super(
                    routerSpy,
                    stateSpy,
                    gaSpy,
                    clusterConfigSpy,
                    eventSpy,
                    timerSpy)
            }
        })
    })

    beforeEach(async () => {
        routerSpy.navigate.calls.reset()
        stateSpy.subscribe.calls.reset()
        gaSpy.createAndRun.calls.reset()
        gaSpy.run.calls.reset()
        clusterConfigSpy.getConfig.calls.reset()
        eventSpy.addEventListener.calls.reset()
        eventSpy.dispatchEvent.calls.reset()
        eventSpy.removeEventListener.calls.reset()
        timerSpy.clearTimeout.calls.reset()
        timerSpy.setTimeout.calls.reset()

        timerSpy.setTimeout.and.returnValue(timeoutId)
        stateSubscriptionSpy = jasmine.createSpyObj<StateSubscription>('StateSubscription', [ 'unsubscribe' ])
        stateSpy.subscribe.and.returnValue(stateSubscriptionSpy)
        clusterConfigSpy.getConfig.and.returnValue({
            maxIterations: clusterConfigMaxIterations,
            numberOfRepresentatives: 10,
            stopThreshold: 1
        })

        el = await fixture(html`<rf-pipeline-test></rf-pipeline-test>`)
    })

    it('should show popup', () => {
        const popup = el.shadowRoot?.querySelector('rf-popup') as PopupElementStub

        expect(popup.show).toBeTrue()
    })

    it('should set timeout for receiving run params', async () => {
        const [ onTimeout, duration ] = timerSpy.setTimeout.calls.mostRecent().args

        expect(duration).toEqual(300)

        if (typeof onTimeout === 'string') {
            throw new Error('Got string handler for setTimeout')
        }

        onTimeout()
        await elementUpdated(el)

        const heading = el.shadowRoot?.querySelector('h1')
        expect(heading?.textContent).toContain('Aborted')
        const startOverButton = el.shadowRoot?.querySelector('rf-button[buttonrole="success"]')
        expect(startOverButton).toBeTruthy()
    })

    describe('run params handler', () => {
        let handler: (params: PipelineRunParams) => Promise<void>

        beforeEach(() => {
            const call = stateSpy.subscribe.calls.all()
                .find(call => call.args[0] === StateTopic.PipelineRunParams)
            if (!call) {
                throw Error('did not call StateMediatorService.subscribe with StateTopic.PipelineRunParams')
            }
            handler = call.args[1]
        })

        it('should clear params timeout', async () => {
            await handler({} as PipelineRunParams)

            expect(timerSpy.clearTimeout).toHaveBeenCalledWith(timeoutId)
        })

        it('should navigate to "/" if params have been cleared', async () => {
            await handler({ cleared: true })

            expect(routerSpy.navigate).toHaveBeenCalledWith('/')
        })

        it('should abort and display button to start over if given bad params', async () => {
            await handler({} as PipelineRunParams)
            await elementUpdated(el)

            const heading = el.shadowRoot?.querySelector('h1')
            expect(heading?.textContent).toContain('Aborted')
            const startOverButton = el.shadowRoot?.querySelector('rf-button[buttonrole="success"]')
            if (!startOverButton) { throw new Error('missing start over button') }
            startOverButton.dispatchEvent(new Event('click'))
            expect(routerSpy.navigate).toHaveBeenCalledWith('/')
            expect(eventSpy.dispatchEvent).toHaveBeenCalledWith(
                new UpdateStateEvent(StateTopic.PipelineRunParams, { cleared: true }))
        })

        it(
            'should display heading as running and display cancel button when given run params for existing GA',
            async () => {
                gaSpy.run.and.returnValue(new Promise(async resolve => {
                    await elementUpdated(el)
                    const heading = el.shadowRoot?.querySelector('h1')
                    expect(heading?.textContent).toContain('Running')

                    const cancelButton = el.shadowRoot?.querySelector('rf-button[buttonrole="danger"]')
                    expect(cancelButton).toBeTruthy()
                    resolve({ isCanceled: false, geneticAlgorithmId: 'a' })
                }))

                await handler({ geneticAlgorithmId: 'a', numberOfGenerations: 1 })
        })

        it(
            'should display heading as running and display cancel button when given run params for new GA',
            async () => {
                gaSpy.createAndRun.and.returnValue(new Promise(async resolve => {
                    await elementUpdated(el)
                    const heading = el.shadowRoot?.querySelector('h1')
                    expect(heading?.textContent).toContain('Running')

                    const cancelButton = el.shadowRoot?.querySelector('rf-button[buttonrole="danger"]')
                    expect(cancelButton).toBeTruthy()
                    resolve({ isCanceled: false, geneticAlgorithmId: 'a' })
                }))

                await handler({
                    size: 1,
                    genomeSize: 1
                } as NewPipelineRunParams)
        })

        it('should display cancel button that dispatches cancel event and changes heading to "Canceling"', async () => {
            gaSpy.run.and.returnValue(new Promise(async resolve => {
                await elementUpdated(el)

                const cancelButton = el.shadowRoot?.querySelector('rf-button[buttonrole="danger"]')
                if (!cancelButton) { throw new Error('missing cancel button') }
                cancelButton.dispatchEvent(new Event('click'))
                await elementUpdated(el)

                const heading = el.shadowRoot?.querySelector('h1')
                expect(heading?.textContent).toContain('Canceling')
                expect(eventSpy.dispatchEvent).toHaveBeenCalledWith(new CancelPipelineEvent())
                resolve({ isCanceled: true, geneticAlgorithmId: 'a' })
            }))

            await handler({ geneticAlgorithmId: 'a', numberOfGenerations: 1 })
        })

        it('should navigate to "/representatives/:id" if GA run succeeds', async () => {
            const geneticAlgorithmId = 'a'
            gaSpy.run.and.returnValue(Promise.resolve({ geneticAlgorithmId, isCanceled: false }))

            await handler({ geneticAlgorithmId, numberOfGenerations: 1 })

            expect(routerSpy.navigate).toHaveBeenCalledWith(`/representatives/${geneticAlgorithmId}`)
        })

        it('should abort and display cancel message if GA run was canceled', async () => {
            gaSpy.run.and.returnValue(Promise.resolve({ geneticAlgorithmId: 'a', isCanceled: true }))

            await handler({ geneticAlgorithmId: 'a', numberOfGenerations: 1 })

            expect(el.shadowRoot?.querySelector('p')?.textContent).toContain('canceled')
        })

        it('should abort and display cancel message if GA returns error', async () => {
            gaSpy.run.and.returnValue(
                Promise.resolve({ geneticAlgorithmId: 'a', isCanceled: false, error: new Error('') }))

            await handler({ geneticAlgorithmId: 'a', numberOfGenerations: 1 })

            expect(el.shadowRoot?.querySelector('p')?.textContent).toContain('went wrong')
        })

        it('should abort and display start over button if GeneticAlgorithmService throws', async () => {
            gaSpy.run.and.throwError(new Error())
            const params: ExistingPipelineRunParams = { geneticAlgorithmId: '', numberOfGenerations: 1 }
            await handler(params)
            await elementUpdated(el)

            const heading = el.shadowRoot?.querySelector('h1')
            expect(heading?.textContent).toContain('Aborted')
            const startOverButton = el.shadowRoot?.querySelector('rf-button[buttonrole="success"]')
            if (!startOverButton) { throw new Error('missing start over button') }
            startOverButton.dispatchEvent(new Event('click'))
            expect(routerSpy.navigate).toHaveBeenCalledWith('/')
            expect(eventSpy.dispatchEvent).toHaveBeenCalledWith(
                new UpdateStateEvent(StateTopic.PipelineRunParams, { cleared: true }))
        })
    })

    describe('pipeline progress handler', () => {
        let handler: EventListener

        beforeEach(() => {
            handler = eventSpy.addEventListener.calls.mostRecent().args[1] as EventListener
        })

        it('should stop event propagation', () => {
            const event = new PipelineProgressEvent({
                stageName: PipelineStageName.GetClusterResult,
                detail: { message: '' }
            })
            const spy = spyOn(event, 'stopPropagation')

            handler(event)

            expect(spy).toHaveBeenCalled()
        })

        it('should display report message if not a GA or Cluster progress message', async () => {
            const message = 'test message'
            const event = new PipelineProgressEvent({
                stageName: PipelineStageName.GetClusterResult,
                detail: { message }
            })

            handler(event)

            await elementUpdated(el)
            expect(el.shadowRoot?.querySelector('p')?.textContent).toContain(message)
        })

        it('should set progress bar percentage given GA progress message', async () => {
            const percentComplete = 34
            const event = new PipelineProgressEvent({
                stageName: PipelineStageName.RunGeneticAlgorithmWorker,
                detail: {
                    type: GeneticAlgorithmWorkerMessageType.Progress,
                    percentComplete
                }
            })

            handler(event)

            await elementUpdated(el)
            expect(el.shadowRoot?.querySelector('p')?.textContent).toContain('Running genetic algorithm')
            expect((el.shadowRoot?.querySelector('rf-progress-bar') as ProgressBarElementStub).percentage)
                .toEqual(percentComplete)
        })

        it(
            'should set progress bar percentage to percentage of iterations completed given ClusterProgressMessage',
            async () => {
                const iteration = 34
                const event = new PipelineProgressEvent({
                    stageName: PipelineStageName.RunClusterWorker,
                    detail: {
                        type: ClusterWorkerMessageType.Progress,
                        iteration
                    }
                })
                const expectedPercentage = Math.floor((iteration / clusterConfigMaxIterations) * 100)

                handler(event)

                await elementUpdated(el)
                expect(el.shadowRoot?.querySelector('p')?.textContent).toContain('Clustering population')
                expect((el.shadowRoot?.querySelector('rf-progress-bar') as ProgressBarElementStub).percentage)
                    .toEqual(expectedPercentage)
        })
    })

    describe('disconnectedCallback', () => {
        beforeEach(() => {
            el.disconnectedCallback()
        })
        it('should unsubscribe from state', () => {
            expect(stateSubscriptionSpy.unsubscribe).toHaveBeenCalled()
        })

        it('should remove pipeline progress event listener', () => {
            expect(eventSpy.removeEventListener)
                .toHaveBeenCalledWith(pipelineProgressEventType, jasmine.any(Function))
        })

        it('should clear params timeout', () => {
            expect(timerSpy.clearTimeout).toHaveBeenCalledWith(timeoutId)
        })
    })
})

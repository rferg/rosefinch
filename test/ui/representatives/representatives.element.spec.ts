import { property } from 'lit-element'
import { SerializedGeneticAlgorithmOptions } from '../../../src/genetic-algorithm'
import { RepresentativeGenesService } from '../../../src/services/pipeline'
import { StateMediatorService, StateSubscription } from '../../../src/services/state'
import { GeneticAlgorithmOptionsRepository } from '../../../src/storage'
import { BaseElement } from '../../../src/ui/core/base-element'
import { Router } from '../../../src/ui/core/router'
import { RepresentativesElement } from '../../../src/ui/representatives/representatives.element'
import { ContainerElementStub } from '../../helpers/container-element-stub'
import { CustomElementRegistrar } from '../../helpers/custom-element-registrar'
import { PopupElementStub } from '../../helpers/popup-element-stub'

class RepresentativesHeaderElementStub extends BaseElement {
    static get is() { return 'rf-representatives-header' }
    @property()
    options?: SerializedGeneticAlgorithmOptions
}

class EditRepresentativeStub extends BaseElement {
    static get is() { return 'rf-edit-representative' }
    @property()
    genome?: number[]
}

class RepresentativeElementStub extends BaseElement {
    static get is() { return 'rf-representative' }
    @property()
    genome?: number[]

    @property()
    rating = 0
}

describe('RepresentativesElement', () => {
    const stateSpy = jasmine.createSpyObj<StateMediatorService>('StateMediatorService', [ 'subscribe' ])
    const subscriptionSpy = jasmine.createSpyObj<StateSubscription>('StateSubscription', [ 'unsubscribe' ])
    stateSpy.subscribe.and.returnValue(subscriptionSpy)
    const routerSpy = jasmine.createSpyObj<Router>('Router', [ 'navigate' ])
    const genesServiceSpy = jasmine.createSpyObj<RepresentativeGenesService>(
        'RepresentativeGenesService',
        [ 'getGenes' ])
    const optionsRepoSpy = jasmine.createSpyObj<GeneticAlgorithmOptionsRepository>(
        'GeneticAlgorithmOptionsRepository',
        [ 'get' ])
    const eventSpy = jasmine.createSpyObj<EventTarget>(
        'EventTarget',
        [ 'addEventListener', 'dispatchEvent', 'removeEventListener' ])

    beforeAll(() => {
        CustomElementRegistrar.instance.register(RepresentativesHeaderElementStub.is, RepresentativesHeaderElementStub)
        CustomElementRegistrar.instance.register(EditRepresentativeStub.is, EditRepresentativeStub)
        CustomElementRegistrar.instance.register(RepresentativeElementStub.is, RepresentativeElementStub)
        CustomElementRegistrar.instance.register(ContainerElementStub.is, ContainerElementStub)
        CustomElementRegistrar.instance.register(PopupElementStub.is, PopupElementStub)
        CustomElementRegistrar.instance.register('rf-representatives-test', class extends RepresentativesElement {
            constructor() {
                super(stateSpy, routerSpy, genesServiceSpy, optionsRepoSpy, eventSpy)
            }
        })
    })

    beforeEach(() => {
        stateSpy.subscribe.calls.reset()
        subscriptionSpy.unsubscribe.calls.reset()
        routerSpy.navigate.calls.reset()
        genesServiceSpy.getGenes.calls.reset()
        optionsRepoSpy.get.calls.reset()
        eventSpy.dispatchEvent.calls.reset()
        eventSpy.addEventListener.calls.reset()
        eventSpy.removeEventListener.calls.reset()
    })

    describe('disconnectedCallback', () => {
        // TODO
    })

    describe('constructor', () => {
        // TODO

        describe('route params subscription', () => {
            // TODO

            describe('representative genes subscription', () => {
                // TODO
            })

            describe('options subscription', () => {
                // TODO
            })
        })
    })
})

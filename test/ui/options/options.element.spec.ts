import { fixture } from '@open-wc/testing-helpers'
import { html, property } from 'lit-element'
import { OptionsElement } from '../../../src/ui/options/options.element'
import { ContainerElementStub } from '../../helpers/container-element-stub'
import { CustomElementRegistrar } from '../../helpers/custom-element-registrar'
import { PopupElementStub } from '../../helpers/popup-element-stub'
import { RunConfirmFormElementStub } from '../../helpers/run-confirm-form-element-stub'
import { OptionsFormService } from '../../../src/services'
import { RouterOutletElementStub } from '../../helpers/router-outlet-element-stub'
import { ScaleIntervalConfig } from '../../../src/genetic-algorithm/fitness/scale-interval-config'
import { FitnessMethod } from '../../../src/genetic-algorithm'
import { FormSubmitEvent } from '../../../src/ui/options/form-submit-event'
import { ModuleName } from '../../../src/ui/core/module-name'
import { BaseElement } from '../../../src/ui/core/base-element'
import { ButtonElementStub } from '../../helpers/button-element-stub'
import { cancelEventType } from '../../../src/ui/options/cancel-event-type'
import { Router } from '../../../src/ui/core/router'
import { StateMediatorService } from '../../../src/services/state'

class OptionsNavElementStub extends BaseElement {
    static get is() { return 'rf-options-nav' }
}

class OptionsTemplateElementStub extends BaseElement {
    static get is() { return 'rf-options-template' }

    @property()
    templateId?: string

    @property()
    errorMessage?: string

    @property()
    templateName?: string
}

describe('OptionsElement', () => {
    const formsServiceSpy = jasmine.createSpyObj<OptionsFormService>(
        'OptionsFormService',
        [ 'update', 'reset', 'updateRunParams', 'setTemplate' ])
    const routerSpy = jasmine.createSpyObj<Router>('Router', [ 'navigate' ])
    const stateSpy = jasmine.createSpyObj<StateMediatorService>('StateMediatorService', [ 'subscribe' ])
    let stateSubscriptionSpy: jasmine.Spy
    let el: OptionsElement

    beforeAll(() => {
        CustomElementRegistrar.instance.register(ContainerElementStub.is, ContainerElementStub)
        CustomElementRegistrar.instance.register(RunConfirmFormElementStub.is, RunConfirmFormElementStub)
        CustomElementRegistrar.instance.register(PopupElementStub.is, PopupElementStub)
        CustomElementRegistrar.instance.register(RouterOutletElementStub.is, RouterOutletElementStub)
        CustomElementRegistrar.instance.register(OptionsNavElementStub.is, OptionsNavElementStub)
        CustomElementRegistrar.instance.register(OptionsTemplateElementStub.is, OptionsTemplateElementStub)
        CustomElementRegistrar.instance.register(
            'rf-options-test',
            class extends OptionsElement { constructor() { super(formsServiceSpy, routerSpy, stateSpy) } })
    })

    beforeEach(async () => {
        formsServiceSpy.reset.calls.reset()
        formsServiceSpy.update.calls.reset()
        formsServiceSpy.updateRunParams.calls.reset()
        routerSpy.navigate.calls.reset()
        stateSpy.subscribe.calls.reset()

        stateSubscriptionSpy = jasmine.createSpy()
        stateSpy.subscribe.and.returnValue({ unsubscribe: stateSubscriptionSpy })

        el = await fixture(html`<rf-options-test></rf-options-test>`)

        // Default route parameters: pass in no templateId
        const stateListener = stateSpy.subscribe.calls.mostRecent().args[1]
        await stateListener({ params: {} })
    })

    it('should create', () => {
        expect(el).toBeDefined()
    })

    it('should reset form through service', () => {
        expect(formsServiceSpy.reset).toHaveBeenCalled()
    })

    it('should render options nav', () => {
        expect(el.shadowRoot?.querySelector(OptionsNavElementStub.is)).toBeTruthy()
    })

    it('should render router outlet with options module name', () => {
        const routerOutlet = el.shadowRoot?.querySelector(RouterOutletElementStub.is) as RouterOutletElementStub

        expect(routerOutlet.moduleName).toEqual(ModuleName.Options)
    })

    it('should update form through service on FormSubmitEvent', () => {
        const routerOutlet = el.shadowRoot?.querySelector(RouterOutletElementStub.is)
        if (!routerOutlet) { throw new Error('RouterOutletElement is missing') }
        const property = 'scale'
        const value: ScaleIntervalConfig = {
            method: FitnessMethod.ScaleInterval,
            options: { scale: { pitches: [ 1 ] }, intervalScores: [ 0.5 ] }
        }

        routerOutlet?.dispatchEvent(new FormSubmitEvent({ value: { [property]: value } }))

        expect(formsServiceSpy.update).toHaveBeenCalledWith(property, value)
    })

    it('should toggle hiding nav on button click', () => {
        const button = el.shadowRoot?.querySelector(`#optionsNav ${ButtonElementStub.is}`) as ButtonElementStub
        if (!button) { throw new Error('missing button') }
        button.dispatchEvent(new Event('click'))

        expect(el.navIsHidden).toBeTrue()

        button.dispatchEvent(new Event('click'))

        expect(el.navIsHidden).toBeFalse()
    })

    it('should update run params service and navigate to run router when run confirm form confirms', () => {
        const numberOfGenerations = 1
        const confirmForm = el.shadowRoot?.querySelector(RunConfirmFormElementStub.is)
        if (!confirmForm) { throw new Error('missing confirm form') }
        confirmForm.dispatchEvent(new FormSubmitEvent<{ numberOfGenerations: number }>(
            { value: { numberOfGenerations } }))

        expect(el.showConfirm).toBeFalse()
        expect(formsServiceSpy.updateRunParams).toHaveBeenCalledWith(numberOfGenerations)
        expect(formsServiceSpy.update).not.toHaveBeenCalled()
        expect(routerSpy.navigate).toHaveBeenCalledWith('/run')
    })

    it('should hide confirm popup if cancel clicked', () => {
        el.showConfirm = true
        const confirmForm = el.shadowRoot?.querySelector(RunConfirmFormElementStub.is)
        if (!confirmForm) { throw new Error('missing confirm form') }
        confirmForm.dispatchEvent(new CustomEvent(cancelEventType))

        expect(el.showConfirm).toBeFalse()
    })

    it('should show confirm popup on run button click', () => {
        const button = el.shadowRoot?.querySelector(`${ButtonElementStub.is}[title="Run"]`)
        if (!button) { throw new Error('missing button') }
        button.dispatchEvent(new Event('click'))

        expect(el.showConfirm).toBeTrue()
    })

    describe('disconnectedCallback', () => {
        it('should unsubscribe from StateMediatorService', () => {
            el.disconnectedCallback()

            expect(stateSubscriptionSpy).toHaveBeenCalled()
        })
    })

    describe('with template', () => {
        let elWithTemplate: OptionsElement
        const templateInfo = { id: 'id', name: 'name' }

        beforeEach(async () => {
            formsServiceSpy.setTemplate.and.returnValue(Promise.resolve(templateInfo))
            elWithTemplate = await fixture(html`<rf-options-test></rf-options-test>`)
            const stateListener = stateSpy.subscribe.calls.mostRecent().args[1]
            await stateListener({ params: { templateId: templateInfo.id } })
        })

        it('should set template in form service', () => {
            expect(formsServiceSpy.setTemplate).toHaveBeenCalledWith(templateInfo.id)
        })

        it('should render nav and router outlet as normal', () => {
            expect(elWithTemplate.shadowRoot?.querySelector(OptionsNavElementStub.is)).toBeTruthy()
            const routerOutlet = elWithTemplate.shadowRoot
                ?.querySelector(RouterOutletElementStub.is) as RouterOutletElementStub
            expect(routerOutlet.moduleName).toEqual(ModuleName.Options)
        })
    })
})

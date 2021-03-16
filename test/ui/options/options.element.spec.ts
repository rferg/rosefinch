import { fixture } from '@open-wc/testing-helpers'
import { html } from 'lit-element'
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

class OptionsNavElementStub extends BaseElement {
    static get is() { return 'rf-options-nav' }
}

describe('OptionsElement', () => {
    const formsServiceSpy = jasmine.createSpyObj<OptionsFormService>(
        'OptionsFormService',
        [ 'update', 'reset', 'run' ])
    let el: OptionsElement

    beforeAll(() => {
        CustomElementRegistrar.instance.register(ContainerElementStub.is, ContainerElementStub)
        CustomElementRegistrar.instance.register(RunConfirmFormElementStub.is, RunConfirmFormElementStub)
        CustomElementRegistrar.instance.register(PopupElementStub.is, PopupElementStub)
        CustomElementRegistrar.instance.register(RouterOutletElementStub.is, RouterOutletElementStub)
        CustomElementRegistrar.instance.register(OptionsNavElementStub.is, OptionsNavElementStub)
        CustomElementRegistrar.instance.register(
            'rf-options-test',
            class extends OptionsElement { constructor() { super(formsServiceSpy) } })
    })

    beforeEach(async () => {
        formsServiceSpy.reset.calls.reset()
        formsServiceSpy.update.calls.reset()
        formsServiceSpy.run.calls.reset()

        el = await fixture(html`<rf-options-test></rf-options-test>`)
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

    it('should run through service when run confirm form confirms', () => {
        const numberOfGenerations = 1
        const confirmForm = el.shadowRoot?.querySelector(RunConfirmFormElementStub.is)
        if (!confirmForm) { throw new Error('missing confirm form') }
        confirmForm.dispatchEvent(new FormSubmitEvent<{ numberOfGenerations: number }>(
            { value: { numberOfGenerations } }))

        expect(el.showConfirm).toBeFalse()
        expect(formsServiceSpy.run).toHaveBeenCalledWith(numberOfGenerations)
        expect(formsServiceSpy.update).not.toHaveBeenCalled()
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
})

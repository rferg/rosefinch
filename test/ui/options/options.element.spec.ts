import { fixture } from '@open-wc/testing-helpers'
import { html } from 'lit-element'
import { OptionsElement } from '../../../src/ui/options/options.element'
import { ContainerElementStub } from '../../helpers/container-element-stub'
import { CustomElementRegistrar } from '../../helpers/custom-element-registrar'
import { PopupElementStub } from '../../helpers/popup-element-stub'
import { RunConfirmFormElementStub } from '../../helpers/run-confirm-form-element-stub'
import { OptionsFormService } from '../../../src/services'

describe('OptionsElement', () => {
    const formsServiceSpy = jasmine.createSpyObj<OptionsFormService>(
        'OptionsFormService',
        [ 'update', 'reset', 'run' ])
    let el: OptionsElement

    beforeAll(() => {
        CustomElementRegistrar.instance.register(ContainerElementStub.is, ContainerElementStub)
        CustomElementRegistrar.instance.register(RunConfirmFormElementStub.is, RunConfirmFormElementStub)
        CustomElementRegistrar.instance.register(PopupElementStub.is, PopupElementStub)
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
})

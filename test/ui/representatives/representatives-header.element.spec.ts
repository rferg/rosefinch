import { fixture } from '@open-wc/testing-helpers'
import { html } from 'lit-element'
import { PopupContent } from '../../../src/ui/representatives/popup-content'
import { RepresentativesHeaderElement } from '../../../src/ui/representatives/representatives-header.element'
import { ButtonElementStub } from '../../helpers/button-element-stub'
import { ContainerElementStub } from '../../helpers/container-element-stub'
import { CustomElementRegistrar } from '../../helpers/custom-element-registrar'
import { IconElementStub } from '../../helpers/icon-element-stub'

describe('RepresentativesHeaderElement', () => {
    beforeAll(() => {
        CustomElementRegistrar.instance.register(ContainerElementStub.is, ContainerElementStub)
        CustomElementRegistrar.instance.register(ButtonElementStub.is, ButtonElementStub)
        CustomElementRegistrar.instance.register(IconElementStub.is, IconElementStub)
        CustomElementRegistrar.instance.register('rf-representatives-header-test', RepresentativesHeaderElement)
    })

    it('should render generation number', async () => {
        const generation = 1111
        const el = await fixture(
            html`<rf-representatives-header-test .generation=${generation}></rf-representatives-header-test>`)

        expect(el.shadowRoot?.textContent).toContain(`Generation ${generation.toLocaleString()}`)
    })

    describe('buttons', () => {
        let el: RepresentativesHeaderElement

        beforeEach(async () => {
            el = await fixture(
                html`<rf-representatives-header-test .generation=${1}></rf-representatives-header-test>`)
        })

        it('should dispatch show-popup event for playback options on button click', () => {
            const spy = spyOn(el, 'dispatchEvent')
            const selector = 'rf-button[title*="Playback"]'
            const button = el.shadowRoot?.querySelector(selector)
            if (!button) { throw new Error(`missing ${selector}`) }

            button.dispatchEvent(new Event('click'))

            expect((spy.calls.mostRecent().args[0] as CustomEvent<PopupContent>).detail)
                .toEqual('playback')
        })

        it('should dispatch show-popup event for fitness options on button click', () => {
            const spy = spyOn(el, 'dispatchEvent')
            const selector = 'rf-button[title*="Fitness"]'
            const button = el.shadowRoot?.querySelector(selector)
            if (!button) { throw new Error(`missing ${selector}`) }

            button.dispatchEvent(new Event('click'))

            expect((spy.calls.mostRecent().args[0] as CustomEvent<PopupContent>).detail)
                .toEqual('fitness')
        })

        it('should dispatch show-popup event for run on button click', () => {
            const spy = spyOn(el, 'dispatchEvent')
            const selector = 'rf-button[title*="Run"]'
            const button = el.shadowRoot?.querySelector(selector)
            if (!button) { throw new Error(`missing ${selector}`) }

            button.dispatchEvent(new Event('click'))

            expect((spy.calls.mostRecent().args[0] as CustomEvent<PopupContent>).detail)
                .toEqual('run')
        })
    })

})

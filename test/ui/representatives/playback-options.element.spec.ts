import { elementUpdated, fixture, oneEvent } from '@open-wc/testing-helpers'
import { html } from 'lit-element'
import { Instrument, PlaybackOptions } from '../../../src/services/playback'
import { cancelEventType } from '../../../src/ui/options/cancel-event-type'
import { FormFieldChangeEvent } from '../../../src/ui/options/form-field-change-event'
import { FormStatusEvent } from '../../../src/ui/options/form-status-event'
import { FormSubmitEvent } from '../../../src/ui/options/form-submit-event'
import { PlaybackOptionsElement } from '../../../src/ui/representatives/playback-options.element'
import { ButtonElementStub } from '../../helpers/button-element-stub'
import { ContainerElementStub } from '../../helpers/container-element-stub'
import { CustomElementRegistrar } from '../../helpers/custom-element-registrar'
import { IconElementStub } from '../../helpers/icon-element-stub'
import { InputElementStub } from '../../helpers/input-element-stub'
import { InsideContainerElementStub } from '../../helpers/inside-container-element-stub'

describe('PlaybackOptionsElement', () => {
    beforeAll(() => {
        CustomElementRegistrar.instance.register(ContainerElementStub.is, ContainerElementStub)
        CustomElementRegistrar.instance.register(InsideContainerElementStub.is, InsideContainerElementStub)
        CustomElementRegistrar.instance.register(InputElementStub.is, InputElementStub)
        CustomElementRegistrar.instance.register(ButtonElementStub.is, ButtonElementStub)
        CustomElementRegistrar.instance.register(IconElementStub.is, IconElementStub)

        CustomElementRegistrar.instance.register('rf-playback-options-test', PlaybackOptionsElement)
    })

    it('should render instrument select field with correct options', async () => {
        const options: PlaybackOptions = { instrument: Instrument.Piano }
        const el = await fixture(html`<rf-playback-options-test .options=${options}></rf-playback-options-test>`)

        const input = el.shadowRoot?.getElementById('instrument') as InputElementStub
        if (!input) { throw new Error('missing instrument select input') }

        expect(input.inputType).toEqual('select')
        expect(input.options).toEqual(Object.keys(Instrument).map(key => {
            const value = Instrument[key as Instrument]
            return { label: value, value }
        }))
        expect(input.value).toEqual(options.instrument)
    })

    it('should render tempo number field', async () => {
        const options: PlaybackOptions = { bpm: 1 }
        const el = await fixture(html`<rf-playback-options-test .options=${options}></rf-playback-options-test>`)

        const input = el.shadowRoot?.getElementById('bpm') as InputElementStub
        if (!input) { throw new Error('missing bpm input') }

        expect(input.inputType).toEqual('number')
        expect(input.value).toEqual(options.bpm)
    })

    it('should render loop playback select field with correct options', async () => {
        const options: PlaybackOptions = { loop: true }
        const el = await fixture(html`<rf-playback-options-test .options=${options}></rf-playback-options-test>`)

        const input = el.shadowRoot?.getElementById('loop') as InputElementStub
        if (!input) { throw new Error('missing loop select input') }

        expect(input.inputType).toEqual('select')
        expect(input.options).toEqual([
            { value: 0, label: 'No' },
            { value: 1, label: 'Yes' }
        ])
        expect(input.value).toEqual(options.loop ? 1 : 0)
    })

    it('should render cancel button that dispatches cancel event when clicked', async () => {
        const el: PlaybackOptionsElement = await fixture(html`<rf-playback-options-test></rf-playback-options-test>`)

        setTimeout(() => {
            const button = el.shadowRoot?.querySelector('rf-button[buttonrole="danger"]')
            if (!button) { throw new Error('missing cancel button') }
            button.dispatchEvent(new Event('click'))
        }, 0)

        const event = await oneEvent(el, cancelEventType)
        expect(event).toBeTruthy()
    })

    it('should render submit button that dispatches form submit event on click', async () => {
        const el: PlaybackOptionsElement = await fixture(html`<rf-playback-options-test></rf-playback-options-test>`)

        setTimeout(() => {
            const button = el.shadowRoot?.querySelector('rf-button[buttonrole="success"]')
            if (!button) { throw new Error('missing submit button') }
            button.dispatchEvent(new Event('click'))
        }, 0)

        const event = await oneEvent(el, FormSubmitEvent.eventType)
        expect(event).toBeTruthy()
    })

    it('should emit updated form value on submit', async () => {
        const options: PlaybackOptions = {}
        const el: PlaybackOptionsElement = await fixture(
            html`<rf-playback-options-test .options=${options}></rf-playback-options-test>`)

        const instrumentInput = el.shadowRoot?.getElementById('instrument') as InputElementStub
        const bpmInput = el.shadowRoot?.getElementById('bpm') as InputElementStub
        const loopInput = el.shadowRoot?.getElementById('loop') as InputElementStub
        if (!(instrumentInput && bpmInput && loopInput)) {
            throw new Error('missing input(s)')
        }
        const expected: PlaybackOptions = {
            instrument: Instrument.Piano,
            bpm: 1,
            loop: true
        }
        instrumentInput.value = expected.instrument
        instrumentInput.dispatchEvent(new FormFieldChangeEvent({
            value: { instrument: expected.instrument },
            isValid: true
        }))
        bpmInput.value = expected.bpm
        bpmInput.dispatchEvent(new FormFieldChangeEvent({
            value: { bpm: expected.bpm },
            isValid: true
        }))
        loopInput.value = expected.loop ? 1 : 0
        loopInput.dispatchEvent(new FormFieldChangeEvent({
            value: { loop: expected.loop ? 1 : 0 },
            isValid: true
        }))
        await elementUpdated(el)

        setTimeout(() => {
            const button = el.shadowRoot?.querySelector('rf-button[buttonrole="success"]')
            if (!button) { throw new Error('missing submit button') }
            button.dispatchEvent(new Event('click'))
        }, 0)

        const event = await oneEvent(el, FormSubmitEvent.eventType) as FormSubmitEvent<PlaybackOptions>
        expect(event).toBeTruthy()
        expect(event.value).toEqual(expected)
    })

    describe('constructor', () => {
        describe('form status listener', () => {
            let el: PlaybackOptionsElement

            beforeEach(async () => {
                el = await fixture(html`<rf-playback-options-test></rf-playback-options-test>`)
            })

            it('should add listener for form status events that sets isValid', async () => {
                const isValid = false
                el.dispatchEvent(new FormStatusEvent({ isValid }))
                await elementUpdated(el)

                expect(el.valid).toBe(isValid)
            })

            it('should disable submit button if not valid', async () => {
                el.dispatchEvent(new FormStatusEvent({ isValid: false }))
                await elementUpdated(el)

                const button = el.shadowRoot?.querySelector('rf-button[buttonrole="success"]')
                if (!button) { throw new Error('submit button missing') }

                expect(button.getAttribute('disabled')).not.toBeNull()
            })
        })
    })
})

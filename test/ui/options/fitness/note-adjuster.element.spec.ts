import { elementUpdated, fixture, oneEvent } from '@open-wc/testing-helpers'
import { html } from 'lit-element'
import { GeneUtil } from '../../../../src/common/gene-util'
import { Pitch } from '../../../../src/common/pitch'
import { NoteAdjusterElement } from '../../../../src/ui/options/fitness/note-adjuster.element'
import { FormFieldChangeEvent } from '../../../../src/ui/options/form-field-change-event'
import { ButtonElementStub } from '../../../helpers/button-element-stub'
import { CustomElementRegistrar } from '../../../helpers/custom-element-registrar'
import { IconElementStub } from '../../../helpers/icon-element-stub'

describe('NoteAdjusterElement', () => {
    let el: NoteAdjusterElement

    beforeAll(() => {
        CustomElementRegistrar.instance.register(IconElementStub.is, IconElementStub)
        CustomElementRegistrar.instance.register(ButtonElementStub.is, ButtonElementStub)
        CustomElementRegistrar.instance.register('rf-note-adjuster-test', NoteAdjusterElement)
    })

    beforeEach(async () => {
        el = await fixture(html`<rf-note-adjuster-test></rf-note-adjuster-test>`)
    })

    it('should create', () => {
        expect(el).toBeDefined()
    })

    it('should display note', async () => {
        el.note = GeneUtil.createAtOctave(Pitch.Bb, 4)
        await elementUpdated(el)

        expect(el.shadowRoot?.textContent).toContain(Pitch[Pitch.Bb])
    })

    it('should emit form field change event when increment button clicked', async () => {
        const originalNote = GeneUtil.createAtOctave(Pitch.Bb, 4)
        const incrementButton = el.shadowRoot?.querySelector('rf-button[data-action="increment"]')
        if (!incrementButton) { throw new Error('missing increment button') }
        el.note = originalNote

        setTimeout(() => {
            incrementButton?.dispatchEvent(new Event('click'))
        }, 0)

        const event = (await oneEvent(el, 'form-field-change')) as FormFieldChangeEvent
        expect(event.value.note).toEqual(originalNote + 1)
    })

    it('should emit value for next non-Rest, non-Hold note when increment button clicked', async () => {
        const originalNote = GeneUtil.createAtOctave(Pitch.B, 4)
        const incrementButton = el.shadowRoot?.querySelector('rf-button[data-action="increment"]')
        if (!incrementButton) { throw new Error('missing increment button') }
        el.note = originalNote

        setTimeout(() => {
            incrementButton?.dispatchEvent(new Event('click'))
        }, 0)

        const event = (await oneEvent(el, 'form-field-change')) as FormFieldChangeEvent
        expect(event.value.note).toEqual(GeneUtil.createAtOctave(Pitch.C, 5))
    })

    it('should emit form field change event when decrement button clicked', async () => {
        const originalNote = GeneUtil.createAtOctave(Pitch.Bb, 4)
        const decrementButton = el.shadowRoot?.querySelector('rf-button[data-action="decrement"]')
        if (!decrementButton) { throw new Error('missing decrement button') }
        el.note = originalNote

        setTimeout(() => {
            decrementButton?.dispatchEvent(new Event('click'))
        }, 0)

        const event = (await oneEvent(el, 'form-field-change')) as FormFieldChangeEvent
        expect(event.value.note).toEqual(originalNote - 1)
    })

    it('should emit value for next non-Rest, non-Hold note when decrement button clicked', async () => {
        const originalNote = GeneUtil.createAtOctave(Pitch.C, 4)
        const decrementButton = el.shadowRoot?.querySelector('rf-button[data-action="decrement"]')
        if (!decrementButton) { throw new Error('missing decrement button') }
        el.note = originalNote

        setTimeout(() => {
            decrementButton?.dispatchEvent(new Event('click'))
        }, 0)

        const event = (await oneEvent(el, 'form-field-change')) as FormFieldChangeEvent
        expect(event.value.note).toEqual(GeneUtil.createAtOctave(Pitch.B, 3))
    })

    it('should disable increment button if note is max', async () => {
        const maxNote = GeneUtil.MAX_NOTE_VALUE - 1
        el.note = maxNote
        await elementUpdated(el)
        const incrementButton = el.shadowRoot?.querySelector('rf-button[data-action="increment"]')
        if (!incrementButton) { throw new Error('missing increment button') }

        expect((incrementButton as ButtonElementStub).disabled).toBeTrue()
    })

    it('should disable decrement button if note is min', async () => {
        const minNote = 1
        el.note = minNote
        await elementUpdated(el)
        const incrementButton = el.shadowRoot?.querySelector('rf-button[data-action="decrement"]')
        if (!incrementButton) { throw new Error('missing decrement button') }

        expect((incrementButton as ButtonElementStub).disabled).toBeTrue()
    })
})

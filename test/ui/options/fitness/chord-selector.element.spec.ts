import { fixture, oneEvent } from '@open-wc/testing-helpers'
import { html } from 'lit-element'
import { GeneUtil } from '../../../../src/common/gene-util'
import { Pitch } from '../../../../src/common/pitch'
import { ChordName, ChordService } from '../../../../src/services'
import { ChordSelectorElement } from '../../../../src/ui/options/fitness/chord-selector.element'
import { FormFieldChangeEvent } from '../../../../src/ui/options/form-field-change-event'
import { CustomElementRegistrar } from '../../../helpers/custom-element-registrar'
import { InputElementStub } from '../../../helpers/input-element-stub'

describe('ChordSelectorElement', () => {
    let el: ChordSelectorElement
    const chordService = jasmine.createSpyObj<ChordService>(
        'ChordService',
        [ 'getPitches' ]
    )

    beforeAll(() => {
        CustomElementRegistrar.instance.register(InputElementStub.is, InputElementStub)
        CustomElementRegistrar.instance.register(
            'rf-chord-selector-test',
            class extends ChordSelectorElement {
                constructor() { super(chordService) }
            })
    })

    beforeEach(async () => {
        chordService.getPitches.calls.reset()
        el = await fixture(html`<rf-chord-selector-test></rf-chord-selector-test>`)
    })

    it('should create', () => {
        expect(el).toBeDefined()
    })

    it('should render select inputs for root note and chord', () => {
        expect(el.shadowRoot?.querySelector('rf-input[inputType="select"][name="root"]'))
            .toBeTruthy()
        expect(el.shadowRoot?.querySelector('rf-input[inputType="select"][name="chordName"]'))
            .toBeTruthy()
    })

    it('should emit updated pitches on chord change', async () => {
        const pitches = [ 1, 2, 3 ]
        const chordName = ChordName.Diminished
        chordService.getPitches.and.returnValue(pitches)
        const input = el.shadowRoot?.querySelector('rf-input[name="chordName"]') as InputElementStub

        if (!input) { throw new Error('missing chordName input') }
        setTimeout(() => {
            input.dispatchEvent(new FormFieldChangeEvent({
                value: { chordName },
                isValid: true
            }))
        }, 0)

        const event = (await oneEvent(el, 'form-field-change')) as FormFieldChangeEvent

        expect(event.value.pitches).toEqual(pitches)
        expect(chordService.getPitches).toHaveBeenCalledWith(GeneUtil.createAtOctave(Pitch.C, 4), chordName)
    })

    it('should emit updated pitches on root change', async () => {
        const pitches = [ 1, 2, 3 ]
        const root = Pitch.A
        chordService.getPitches.and.returnValue(pitches)
        const input = el.shadowRoot?.querySelector('rf-input[name="root"]') as InputElementStub

        if (!input) { throw new Error('missing root input') }
        setTimeout(() => {
            input.dispatchEvent(new FormFieldChangeEvent({
                value: { root },
                isValid: true
            }))
        }, 0)

        const event = (await oneEvent(el, 'form-field-change')) as FormFieldChangeEvent

        expect(event.value.pitches).toEqual(pitches)
        expect(chordService.getPitches).toHaveBeenCalledWith(root, ChordName.Major)
    })
})

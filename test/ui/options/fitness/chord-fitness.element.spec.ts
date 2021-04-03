import { elementUpdated, fixture, oneEvent } from '@open-wc/testing-helpers'
import { html, property } from 'lit-element'
import { calculateGenomeSize } from '../../../../src/common/calculate-genome-size'
import { GeneUtil } from '../../../../src/common/gene-util'
import { Pitch } from '../../../../src/common/pitch'
import { Uint8 } from '../../../../src/common/uint8'
import {
    ChordFitOptions,
    CrossoverMethod,
    FitnessMethod,
    MutationMethod,
    SelectionMethod,
    SerializedGeneticAlgorithmOptions
} from '../../../../src/genetic-algorithm'
import { ChordFitConfig } from '../../../../src/genetic-algorithm/fitness/chord-fit-config'
import { OptionsFormService } from '../../../../src/services'
import { StateMediatorService, StateTopic } from '../../../../src/services/state'
import { BaseElement } from '../../../../src/ui/core/base-element'
import { ChordFitnessElement } from '../../../../src/ui/options/fitness/chord-fitness.element'
import { FormFieldChangeEvent } from '../../../../src/ui/options/form-field-change-event'
import { FormSubmitEvent } from '../../../../src/ui/options/form-submit-event'
import { ButtonElementStub } from '../../../helpers/button-element-stub'
import { CustomElementRegistrar } from '../../../helpers/custom-element-registrar'
import { GenomeNotationElementStub } from '../../../helpers/genome-notation-element-stub'
import { IconElementStub } from '../../../helpers/icon-element-stub'
import { InsideContainerElementStub } from '../../../helpers/inside-container-element-stub'

class NoteAdjusterElementStub extends BaseElement {
    static get is() { return 'rf-note-adjuster' }

    @property()
    note?: number
}

class ChordSelectorElementStub extends BaseElement {
    static get is() { return 'rf-chord-selector' }
}

describe('ChordFitnessElement', () => {
    const formServiceSpy = jasmine.createSpyObj<OptionsFormService>(
        'OptionsFormService',
        [ 'getGeneticAlgorithmOptions' ])
    const stateSpy = jasmine.createSpyObj<StateMediatorService>('StateMediatorService', [ 'subscribe' ])
    let el: ChordFitnessElement
    const defaultConfig: ChordFitConfig = {
        method: FitnessMethod.ChordFit,
        options: { chords: {} }
    }
    const defaultOptions: SerializedGeneticAlgorithmOptions = {
        crossoverMethod: CrossoverMethod.HybridPoint,
        mutationConfig: {
            method: MutationMethod.Point,
            mutationRate: 0.01
        },
        selectionConfig: {
            method: SelectionMethod.Tournament,
            tournamentSize: 2
        },
        fitnessConfigs: [],
        geneFactoryOptions: {
            octaveRange: [ 3, 6 ],
            excludedPitches: []
        },
        timeSignature: [ 4, 4 ],
        measures: 4,
        shortestNoteDuration: 8
    }
    const defaultGenomeSize = calculateGenomeSize(
        defaultOptions.measures,
        defaultOptions.timeSignature,
        defaultOptions.shortestNoteDuration)

    beforeAll(() => {
        CustomElementRegistrar.instance.register(GenomeNotationElementStub.is, GenomeNotationElementStub)
        CustomElementRegistrar.instance.register(ButtonElementStub.is, ButtonElementStub)
        CustomElementRegistrar.instance.register(IconElementStub.is, IconElementStub)
        CustomElementRegistrar.instance.register(InsideContainerElementStub.is, InsideContainerElementStub)
        CustomElementRegistrar.instance.register(ChordSelectorElementStub.is, ChordSelectorElementStub)
        CustomElementRegistrar.instance.register(NoteAdjusterElementStub.is, NoteAdjusterElementStub)
        CustomElementRegistrar.instance.register(
            'rf-chord-fitness-test',
            class extends ChordFitnessElement {
                constructor() { super(formServiceSpy, stateSpy) }
            })
    })

    beforeEach(async () => {
        stateSpy.subscribe.calls.reset()
        formServiceSpy.getGeneticAlgorithmOptions.calls.reset()

        formServiceSpy.getGeneticAlgorithmOptions.and.returnValue(defaultOptions)
        el = await fixture(html`<rf-chord-fitness-test></rf-chord-fitness-test>`)
        const [ topic, listener ] = stateSpy.subscribe.calls.mostRecent().args
        if (topic !== StateTopic.OptionsForm) {
            throw new Error('Incorrect state topic')
        }
        listener({ chords: defaultConfig } as any)
    })

    it('should create', () => {
        expect(el).toBeDefined()
    })

    describe('setter:options', () => {

        beforeEach(async () => {
            await elementUpdated(el)
        })

        it('should set options', async () => {
            const options: ChordFitOptions = { chords: { 0: [ 1 ] } }

            setOptions(el, options)
            await elementUpdated(el)

            expect(el.config.options).toEqual(options)
        })

        it('should dispatch submit event with updated options', async () => {
            const options: ChordFitOptions = { chords: { 0: [ 1 ] } }
            setTimeout(() => {
                setOptions(el, options)
            }, 0)

            const event = (await oneEvent(el, FormSubmitEvent.eventType)) as FormSubmitEvent<{ chords: ChordFitConfig }>

            expect(event.value.chords.options).toEqual(options)
        })

        it('should pass all rests to notation element if no chords in options', async () => {
            const options: ChordFitOptions = { chords: {} }

            setOptions(el, options)
            await elementUpdated(el)

            const notationEl = el.shadowRoot?.querySelector(GenomeNotationElementStub.is) as GenomeNotationElementStub
            if (!notationEl) { throw new Error('missing notation element') }
            const notes = notationEl.genome as number[][]
            expect(notes?.length).toEqual(defaultGenomeSize)
            expect(notationEl.options).toEqual(defaultOptions)
            expect(notes.every(chord =>
                    chord.length === 1 && chord.every(n => GeneUtil.getPitch(n as Uint8) === Pitch.Rest)))
                .toBeTrue()
        })

        it('should pass notes of chords to notation element', async () => {
            const chordAt0 = [ 1, 2, 3 ]
            const chordAt1 = [ 4, 5, 6 ]
            const options: ChordFitOptions = { chords: {
                0: chordAt0,
                1: chordAt1
            }}

            setOptions(el, options)
            await elementUpdated(el)

            const notationEl = el.shadowRoot?.querySelector(GenomeNotationElementStub.is) as GenomeNotationElementStub
            if (!notationEl) { throw new Error('missing notation element') }
            const notes = notationEl.genome as number[][]
            expect(notes?.length).toEqual(defaultGenomeSize)
            expect(notationEl.options).toEqual(defaultOptions)
            const [ actual0, actual1, ...rest ] = notes
            expect(actual0).toEqual(chordAt0)
            expect(actual1).toEqual(chordAt1)
            expect(rest.every(chord =>
                    chord.length === 1 && chord.every(n => GeneUtil.getPitch(n as Uint8) === Pitch.Rest)))
                .toBeTrue()
        })

        it('should update displayed notes if note index has been selected', async () => {
            setOptions(el, { chords: {} })
            const updatedChord = [ 1, 2, 4 ]
            const selectedIndex = 0
            await elementUpdated(el)
            await selectNote(el, selectedIndex)

            setOptions(el, { chords: { [selectedIndex]: updatedChord } })
            await elementUpdated(el)

            const noteAdjusters = el.shadowRoot
                ?.querySelectorAll(NoteAdjusterElementStub.is) as NodeListOf<NoteAdjusterElementStub>
            if (!noteAdjusters) { throw new Error('missing note adjusters') }
            expect(noteAdjusters.length).toEqual(updatedChord.length)
            expect([ ...noteAdjusters ].map(el => el.note)).toEqual(updatedChord)
        })
    })

    describe('setter:genomeAlgorithmOptions', () => {
        beforeEach(async () => {
            await elementUpdated(el)
        })

        it('should set geneticAlgorithmOptions', async () => {
            el.geneticAlgorithmOptions = defaultOptions
            await elementUpdated(el)

            expect(el.geneticAlgorithmOptions).toEqual(defaultOptions)
        })
    })

    describe('on add note', () => {
        const selectedIndex = 0
        let addButton: ButtonElementStub

        beforeEach(async () => {
            await elementUpdated(el)
            await selectNote(el, selectedIndex)
            addButton = el.shadowRoot
                ?.querySelector(`.notes-container > ${ButtonElementStub.is}[buttonRole="success"]`) as ButtonElementStub
            if (!addButton) { throw new Error('add button missing') }
        })

        it('should add default note (C4) to options at selected index', async () => {
            const expected = GeneUtil.createAtOctave(Pitch.C, 4)

            addButton.dispatchEvent(new Event('click'))
            await elementUpdated(el)

            const actual = el.config.options.chords[selectedIndex][0]
            expect(actual).toEqual(expected)
        })

        it('should add next note up of last note to options at selected index', async () => {
            const chord = [ 1, 2, 4 ]
            const expected = 5
            el.config = { ...el.config, options: { chords: { [selectedIndex]: chord } } }
            await elementUpdated(el)

            addButton.dispatchEvent(new Event('click'))
            await elementUpdated(el)

            const actual = el.config.options.chords[selectedIndex][chord.length]
            expect(actual).toEqual(expected)
        })
    })

    describe('on remove note', () => {
        const selectedIndex = 0
        const originalOptions = { chords: { [selectedIndex]: [ 1, 2, 3 ] } }

        const getRemoveButton = (noteIndex: number): ButtonElementStub => {
            const buttons = el.shadowRoot
                ?.querySelectorAll(
                    `.note ${ButtonElementStub.is}[buttonRole="danger"]`) as NodeListOf<ButtonElementStub>
            if (!buttons) { throw new Error('missing remove buttons') }
            const button = buttons.item(noteIndex)
            if (!button) { throw new Error(`missing button for index ${noteIndex}`) }
            return button
        }

        beforeEach(async () => {
            setOptions(el, originalOptions)
            await elementUpdated(el)
            await selectNote(el, selectedIndex)
        })

        it('should remove note at end of chord', async () => {
            const originalChord = originalOptions.chords[selectedIndex]
            const expected = originalChord.slice(0, originalChord.length - 1)
            const removeButton = getRemoveButton(originalChord.length - 1)

            removeButton.dispatchEvent(new Event('click'))
            await elementUpdated(el)

            const actual = el.config.options.chords[selectedIndex]
            expect(actual).toEqual(expected)
        })

        it('should remove note at beginning of chord', async () => {
            const originalChord = originalOptions.chords[selectedIndex]
            const expected = originalChord.slice(1)
            const removeButton = getRemoveButton(0)

            removeButton.dispatchEvent(new Event('click'))
            await elementUpdated(el)

            const actual = el.config.options.chords[selectedIndex]
            expect(actual).toEqual(expected)
        })

        it('should remove note in middle of chord', async () => {
            const originalChord = originalOptions.chords[selectedIndex]
            const expected = [ originalChord[0], ...originalChord.slice(2) ]
            const removeButton = getRemoveButton(1)

            removeButton.dispatchEvent(new Event('click'))
            await elementUpdated(el)

            const actual = el.config.options.chords[selectedIndex]
            expect(actual).toEqual(expected)
        })
    })

    describe('on adjust note', () => {
        const selectedIndex = 0
        const originalOptions = { chords: { [selectedIndex]: [ 1, 2, 3 ] } }

        const getAdjuster = (noteIndex: number): NoteAdjusterElementStub => {
            const adjusters = el.shadowRoot
                ?.querySelectorAll(NoteAdjusterElementStub.is) as NodeListOf<NoteAdjusterElementStub>
            if (!adjusters) { throw new Error('missing adjusters') }
            const adjuster = adjusters.item(noteIndex)
            if (!adjuster) { throw new Error(`missing adjuster for index ${noteIndex}`) }
            return adjuster
        }

        beforeEach(async () => {
            setOptions(el, originalOptions)
            await elementUpdated(el)
            await selectNote(el, selectedIndex)
        })

        it('should update chord note at correct index', async () => {
            const noteIndex = 1
            const originalChord = originalOptions.chords[selectedIndex]
            const adjustedNote = originalChord[noteIndex] + 1
            const expected = originalChord.map((n, i) => i === noteIndex ? adjustedNote : n)
            const noteAdjuster = getAdjuster(noteIndex)

            noteAdjuster.dispatchEvent(new FormFieldChangeEvent({
                value: { note: adjustedNote },
                isValid: true
            }))
            await elementUpdated(el)

            const actual = el.config.options.chords[selectedIndex]
            expect(actual).toEqual(expected)
        })
    })

    describe('on insert chord', () => {
        const selectedIndex = 0
        const originalOptions = { chords: { [selectedIndex]: [ 1, 2, 3 ] } }

        beforeEach(async () => {
            setOptions(el, originalOptions)
            await elementUpdated(el)
            await selectNote(el, selectedIndex)
        })

        it('should replace chord at selected index with last selected chord', async () => {
            const expectedChord = [ 5, 6, 8 ]
            const formFieldSelector = el.shadowRoot
                ?.querySelector(ChordSelectorElementStub.is) as ChordSelectorElementStub
            if (!formFieldSelector) { throw new Error('missing chord selector') }
            formFieldSelector.dispatchEvent(new FormFieldChangeEvent({
                value: { pitches: expectedChord },
                isValid: true
            }))
            const chordSubmitButton = el.shadowRoot
                ?.querySelector(`.chord-selector-container ${ButtonElementStub.is}`) as ButtonElementStub
            if (!chordSubmitButton) { throw new Error('missing chord submit button') }

            chordSubmitButton.dispatchEvent(new Event('click'))
            await elementUpdated(el)

            expect(el.config.options.chords[selectedIndex]).toEqual(expectedChord)
        })
    })
})

function setOptions(el: ChordFitnessElement, options: ChordFitOptions) {
    el.config = {
        ...el.config,
        options
    }
}

async function selectNote(el: ChordFitnessElement, index: number) {
    const notationEl = el.shadowRoot?.querySelector(GenomeNotationElementStub.is) as GenomeNotationElementStub
    if (!notationEl) { throw new Error('missing notation element') }
    const noteSelector = notationEl.clickListener
    if (!noteSelector) { throw new Error('missing click listener') }
    noteSelector({ originalNoteIndex: index, pitches: [], durationInSixteenths: 1, octaves: [] })
    await elementUpdated(el)
}

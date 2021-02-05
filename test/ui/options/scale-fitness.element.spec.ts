import { elementUpdated, fixture, html, oneEvent } from '@open-wc/testing-helpers'
import { GeneUtil } from '../../../src/common/gene-util'
import { Pitch } from '../../../src/common/pitch'
import { Uint8 } from '../../../src/common/uint8'
import { ScaleIntervalOptions } from '../../../src/genetic-algorithm'
import { ScaleName, ScaleService } from '../../../src/services'
import { ValueChangeEvent } from '../../../src/ui/common/value-change-event'
import { FormFieldChangeEvent } from '../../../src/ui/options/form-field-change-event'
import { FormSubmitEvent } from '../../../src/ui/options/form-submit-event'
import { ScaleFitnessElement } from '../../../src/ui/options/scale-fitness.element'
import { CustomElementRegistrar } from '../../helpers/custom-element-registrar'
import { InputElementStub } from '../../helpers/input-element-stub'
import { RangeInputElementStub } from '../../helpers/range-input-element-stub'

describe('ScaleFitnessElement', () => {
    const scaleService = jasmine.createSpyObj<ScaleService>('ScaleService', [ 'getPitches' ])
    let el: ScaleFitnessElement

    beforeAll(() => {
        CustomElementRegistrar.instance.register(InputElementStub.is, InputElementStub)
        CustomElementRegistrar.instance.register(RangeInputElementStub.is, RangeInputElementStub)

        CustomElementRegistrar.instance.register('rf-scale-fitness-test', class extends ScaleFitnessElement {
            constructor() { super(scaleService) }
        })
    })

    beforeEach(async () => {
        scaleService.getPitches.calls.reset()

        el = await fixture(html`<rf-scale-fitness-test></rf-scale-fitness-test>`)
    })

    it('should create', () => {
        expect(el).toBeDefined()
    })

    it('should render select input with scale options', () => {
        const input: InputElementStub | undefined | null = el.shadowRoot?.querySelector('rf-input[name="scaleName"]')
        const expectedOptions = [
            { value: '', label: '(None)' },
            { value: ScaleName.Chromatic, label: 'Chromatic' },
            { value: ScaleName.Major, label: 'Major' },
            { value: ScaleName.NaturalMinor, label: 'Natural Minor' },
            { value: ScaleName.Dorian, label: 'Dorian' },
            { value: ScaleName.Phrygian, label: 'Phrygian' },
            { value: ScaleName.Lydian, label: 'Lydian' },
            { value: ScaleName.Mixolydian, label: 'Mixolydian' },
            { value: ScaleName.Aeolian, label: 'Aeolian' },
            { value: ScaleName.Locrian, label: 'Locrian' },
            { value: ScaleName.MinorPentatonic, label: 'Minor Pentatonic' },
            { value: ScaleName.MajorPentatonic, label: 'Major Pentatonic' },
            { value: ScaleName.Blues, label: 'Blues' },
            { value: ScaleName.PhrygianDominant, label: 'Phrygian Dominant' }
        ]

        expect(input).toBeTruthy()
        expect(input?.options).toEqual(expectedOptions)
    })

    it('should render select input with root note options', () => {
        const input: InputElementStub | undefined | null = el.shadowRoot?.querySelector('rf-input[name="root"]')
        const expectedOptions = [ ...new Array(GeneUtil.OCTAVE_LENGTH - 1) ]
            .map((_, i) => GeneUtil.getPitch(i as Uint8))
            .filter(pitch => pitch !== Pitch.Rest && pitch !== Pitch.Hold)
            .map(pitch => ({ value: pitch, label: Pitch[pitch] }))

        expect(input).toBeTruthy()
        expect(input?.options).toEqual(expectedOptions)
    })

    describe('on scale change', () => {
        const updateScale = (scaleName: ScaleName | '') => {
            const input: InputElementStub | undefined | null =
                el.shadowRoot?.querySelector('rf-input[name="scaleName"]')

            if (!input) { throw new Error('did not find scaleName input') }

            input.dispatchEvent(new FormFieldChangeEvent({
                value: { scaleName },
                isValid: true
            }))
        }

        it('should update options pitches and scale name', async () => {
            const expectedPitches = [ 1, 2, 3 ]
            const expectedScaleName = ScaleName.Aeolian
            scaleService.getPitches.and.returnValue(expectedPitches)

            updateScale(expectedScaleName)
            await elementUpdated(el)

            expect(scaleService.getPitches.calls.mostRecent().args[1]).toEqual(expectedScaleName)
            expect(el.options?.scale.name).toEqual(expectedScaleName)
            expect(el.options?.scale?.pitches).toEqual(expectedPitches)
        })

        it('should set pitches to empty array if scaleName is falsy', async () => {
            const expectedPitches: Pitch[] = []

            updateScale('')
            await elementUpdated(el)

            expect(el.options?.scale.name).toBeFalsy()
            expect(el.options?.scale?.pitches).toEqual(expectedPitches)
        })

        it('should set intervalScores length equal to pitches length if number of pitches increases', async () => {
            const options: ScaleIntervalOptions = {
                scale: { name: ScaleName.MinorPentatonic, pitches: [ 1, 2, 3, 4, 5 ] },
                intervalScores: [ 0, 0.1, 0.2, 0.3, 0.4 ]
            }
            const newPitches = [ ...options.scale.pitches, 5 ]
            scaleService.getPitches.and.returnValue(newPitches)
            const expectedIntervalScores = [ ...options.intervalScores, 0 ]
            el.options = options

            updateScale(ScaleName.Blues)
            await elementUpdated(el)

            expect(el.options.intervalScores).toEqual(expectedIntervalScores)
            expect(el.options.scale.pitches).toEqual(newPitches)
        })

        it('should set intervalScores length equal to pitches length if number of pitches decreases', async () => {
            const options: ScaleIntervalOptions = {
                scale: { name: ScaleName.Blues, pitches: [ 1, 2, 3, 4, 5, 5 ] },
                intervalScores: [ 0, 0.1, 0.2, 0.3, 0.4, 0.5 ]
            }
            const newPitches = options.scale.pitches.slice(0, options.scale.pitches.length - 1)
            scaleService.getPitches.and.returnValue(newPitches)
            const expectedIntervalScores = options.intervalScores.slice(0, options.intervalScores.length - 1)
            el.options = options

            updateScale(ScaleName.Aeolian)
            await elementUpdated(el)

            expect(el.options.intervalScores).toEqual(expectedIntervalScores)
            expect(el.options.scale.pitches).toEqual(newPitches)
        })

        it('should keep same intervalScores if pitches length stays the same', async () => {
            const options: ScaleIntervalOptions = {
                scale: { name: ScaleName.Blues, pitches: [ 1, 2, 3, 4, 5, 5 ] },
                intervalScores: [ 0, 0.1, 0.2, 0.3, 0.4, 0.5 ]
            }
            const newPitches = [ ...options.scale.pitches ]
            scaleService.getPitches.and.returnValue(newPitches)
            const expectedIntervalScores = [ ...options.intervalScores ]
            el.options = options

            updateScale(ScaleName.MinorPentatonic)
            await elementUpdated(el)

            expect(el.options.intervalScores).toEqual(expectedIntervalScores)
            expect(el.options.scale.pitches).toEqual(newPitches)
        })
    })

    describe('on root change', () => {
        const updateRoot = (root: Pitch) => {
            const input: InputElementStub | undefined | null =
                el.shadowRoot?.querySelector('rf-input[name="root"]')

            if (!input) { throw new Error('did not find root input') }

            input.dispatchEvent(new FormFieldChangeEvent({
                value: { root },
                isValid: true
            }))
        }

        it('should update pitches', async () => {
            const options: ScaleIntervalOptions = {
                scale: { name: ScaleName.Aeolian, pitches: [] },
                intervalScores: []
            }
            el.options = options
            const newRoot = Pitch.D
            const expectedPitches = [ 2, 3, 4 ]
            scaleService.getPitches.and.returnValue(expectedPitches)

            updateRoot(newRoot)
            await elementUpdated(el)

            expect(scaleService.getPitches).toHaveBeenCalledWith(
                newRoot,
                options.scale.name || ScaleName.Phrygian)
            expect(el.options?.scale.pitches).toEqual(expectedPitches)
        })

        it('should not update pitches if no scale has been selected', async () => {
            updateRoot(Pitch.D)
            await elementUpdated(el)

            expect(scaleService.getPitches).not.toHaveBeenCalled()
            expect(el.options?.scale.pitches).toBeFalsy()
        })
    })

    describe('on interval score change', () => {
        let options: ScaleIntervalOptions

        const updateIntervalRating = (index: number, rating: number) => {
            const inputs = el.shadowRoot?.querySelectorAll('rf-range-input')
            const input = inputs?.item(index)

            if (!input) { throw new Error(`did not find rf-range-input with index ${index}`) }

            input.dispatchEvent(new ValueChangeEvent<number>(rating))
        }

        beforeEach(async () => {
            options = {
                scale: { name: ScaleName.Aeolian, pitches: [ 1, 2, 3 ] },
                intervalScores: [ 0, 0, 0 ]
            }
            el.options = { ...options }
            await elementUpdated(el)
        })

        it('should update interval score in options', async () => {
            const index = 1
            const rating = 0.5
            updateIntervalRating(index, rating)
            await elementUpdated(el)

            expect(el.options?.intervalScores[index]).toEqual(rating)
        })

        it('should update interval score in input and label', async () => {
            const index = 1
            const rating = 0.5
            updateIntervalRating(index, rating)
            await elementUpdated(el)

            const liEl = el.shadowRoot?.querySelectorAll('ul.degrees-list li').item(index)
            if (!liEl) { throw new Error(`found no interval score input with index ${index}`) }
            const scoreLabel = liEl.querySelectorAll('.container span').item(1)
            expect(scoreLabel.textContent).toContain(rating.toString())
            const input = liEl.querySelector('rf-range-input') as RangeInputElementStub
            expect(input.value).toEqual(rating)
        })
    })

    describe('cancel button', () => {
        it('should emit cancel event on click', async () => {
            const button = el.shadowRoot?.querySelector('rf-button[title="Cancel"]')
            setTimeout(() => button?.dispatchEvent(new Event('click')), 0)

            const event = await oneEvent(el, 'cancel')

            expect(event).toBeTruthy()
        })
    })

    describe('submit button', () => {
        it('should emit FormSubmitEvent with options on click', async () => {
            const options: ScaleIntervalOptions = {
                scale: { name: ScaleName.Aeolian, pitches: [ 1 ] },
                intervalScores: [ 0.1 ]
            }
            el.options = options
            await elementUpdated(el)
            const button = el.shadowRoot?.querySelector('rf-button[title="Save"]')
            setTimeout(() => button?.dispatchEvent(new Event('click')), 0)

            const event = (await oneEvent(el, 'form-submit')) as FormSubmitEvent<ScaleIntervalOptions>

            expect(event).toBeTruthy()
            expect(event.value).toEqual(options)
        })
    })
    
})
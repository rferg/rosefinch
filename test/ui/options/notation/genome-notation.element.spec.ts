import { elementUpdated, fixture } from '@open-wc/testing-helpers'
import { html } from 'lit-element'
import { CrossoverMethod, MutationMethod, SelectionMethod, SerializedGeneticAlgorithmOptions } from '../../../../src/genetic-algorithm'
import { DenominatedNote, NotationService } from '../../../../src/services/notation'
import { GenomeNotationElement } from '../../../../src/ui/options/notation/genome-notation.element'
import { CustomElementRegistrar } from '../../../helpers/custom-element-registrar'

describe('GenomeNotationElement', () => {
    let defaultOptions: SerializedGeneticAlgorithmOptions
    const notationService = jasmine.createSpyObj<NotationService>('NotationService', [ 'drawNotes' ])
    let el: GenomeNotationElement

    beforeAll(() => {
        CustomElementRegistrar.instance.register(
            'rf-genome-notation-test',
            class extends GenomeNotationElement { constructor() { super(notationService) }})
    })

    beforeEach(async () => {
        notationService.drawNotes.calls.reset()

        el = await fixture(html`<rf-genome-notation-test></rf-genome-notation-test>`)

        defaultOptions = {
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
    })

    it('should render notation container', () => {
        expect(el.notesRenderContainer).toBeDefined()
    })

    describe('setter:options', () => {
        it('should set options', async () => {
            el.options = defaultOptions

            await elementUpdated(el)
            expect(el.options).toEqual(defaultOptions)
        })

        it('should call drawNotes if genome is also defined', async () => {
            const genome = [ 1, 2 ]
            el.genome = genome
            el.options = defaultOptions
            await elementUpdated(el)

            expect(notationService.drawNotes)
                .toHaveBeenCalledWith({
                    genome,
                    options: defaultOptions,
                    element: el.notesRenderContainer as HTMLElement,
                    clickListener: undefined
                })
        })

        it('should call drawNotes with clickListener', async () => {
            const clickListener = jasmine.createSpy<(note: DenominatedNote) => void>()
            const genome = [ 1, 2 ]
            el.clickListener = clickListener
            el.genome = genome
            el.options = defaultOptions
            await elementUpdated(el)

            expect(notationService.drawNotes)
                .toHaveBeenCalledWith({
                    genome,
                    options: defaultOptions,
                    element: el.notesRenderContainer as HTMLElement,
                    clickListener
                })
        })
    })

    describe('setter:options', () => {
        it('should set genome', async () => {
            const genome = [ 1, 2, 3 ]
            el.genome = genome

            await elementUpdated(el)
            expect(el.genome).toEqual(genome)
        })

        it('should call drawNotes if options are also defined', async () => {
            const genome = [ 0, 0, 0 ]
            el.options = defaultOptions
            el.genome = genome
            await elementUpdated(el)

            expect(notationService.drawNotes)
                .toHaveBeenCalledWith({
                    genome,
                    options: defaultOptions,
                    element: el.notesRenderContainer as HTMLElement,
                    clickListener: undefined
                })
        })

        it('should call drawNotes if given 2D array', async () => {
            const genome = [ [ 0 ], [ 0 ], [ 0, 1, 2 ] ]
            el.options = defaultOptions
            el.genome = genome
            await elementUpdated(el)

            expect(notationService.drawNotes)
                .toHaveBeenCalledWith({
                    genome,
                    options: defaultOptions,
                    element: el.notesRenderContainer as HTMLElement,
                    clickListener: undefined
                })
        })

        it('should call drawNotes with clickListener', async () => {
            const clickListener = jasmine.createSpy<(note: DenominatedNote) => void>()
            const genome = [ 0, 0, 0 ]
            el.clickListener = clickListener
            el.options = defaultOptions
            el.genome = genome
            await elementUpdated(el)

            expect(notationService.drawNotes)
                .toHaveBeenCalledWith({
                    genome,
                    options: defaultOptions,
                    element: el.notesRenderContainer as HTMLElement,
                    clickListener
                })
        })
    })
})

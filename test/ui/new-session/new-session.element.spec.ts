import { elementUpdated, fixture } from '@open-wc/testing-helpers'
import { html } from 'lit-element'
import { SummaryQueryService } from '../../../src/services/summary-query-service'
import { GeneticAlgorithmSummaryStore } from '../../../src/storage'
import { NewSessionElement } from '../../../src/ui/new-session/new-session.element'
import { ButtonElementStub } from '../../helpers/button-element-stub'
import { ContainerElementStub } from '../../helpers/container-element-stub'
import { CustomElementRegistrar } from '../../helpers/custom-element-registrar'
import { IconElementStub } from '../../helpers/icon-element-stub'
import { InsideContainerElementStub } from '../../helpers/inside-container-element-stub'

describe('NewSessionElement', () => {
    const summarySpy = jasmine.createSpyObj<SummaryQueryService>('SummaryQueryService', [ 'getRecent' ])

    beforeAll(() => {
        CustomElementRegistrar.instance.register(ContainerElementStub.is, ContainerElementStub)
        CustomElementRegistrar.instance.register(InsideContainerElementStub.is, InsideContainerElementStub)
        CustomElementRegistrar.instance.register(ButtonElementStub.is, ButtonElementStub)
        CustomElementRegistrar.instance.register(IconElementStub.is, IconElementStub)
        CustomElementRegistrar.instance.register(
            'rf-new-session-test',
            class extends NewSessionElement {
                constructor() { super(summarySpy) }
            })
    })

    beforeEach(async () => {
        summarySpy.getRecent.calls.reset()
        summarySpy.getRecent.and.returnValue(Promise.resolve([]))
    })

    it('should retrieve all summaries from SummaryQueryService', async () => {
        await fixture(html`<rf-new-session-test></rf-new-session-test>`)

        expect(summarySpy.getRecent).toHaveBeenCalledWith()
    })

    it('should render link to "/options"', async () => {
        const el = await fixture(html`<rf-new-session-test></rf-new-session-test>`)
        const anchor = el.shadowRoot?.querySelector('.new-container a') as HTMLAnchorElement

        expect(anchor.href).toMatch(/\/options$/)
    })

    it('should render only 3 summaries initially', async () => {
        const summaries = [
            { id: '', generation: 1, lastRunOn: new Date() },
            { id: '', generation: 1, lastRunOn: new Date() },
            { id: '', generation: 1, lastRunOn: new Date() },
            { id: '', generation: 1, lastRunOn: new Date() }
        ] as GeneticAlgorithmSummaryStore[]
        summarySpy.getRecent.and.returnValue(Promise.resolve(summaries))
        const el = await fixture(html`<rf-new-session-test></rf-new-session-test>`)

        const summaryEls = el.shadowRoot?.querySelectorAll('.summary')

        expect(summaryEls?.length).toEqual(3)
    })

    it('should show "More" button if number of summaries is > 3', async () => {
        const summaries = [
            { id: '', generation: 1, lastRunOn: new Date() },
            { id: '', generation: 1, lastRunOn: new Date() },
            { id: '', generation: 1, lastRunOn: new Date() },
            { id: '', generation: 1, lastRunOn: new Date() }
        ] as GeneticAlgorithmSummaryStore[]
        summarySpy.getRecent.and.returnValue(Promise.resolve(summaries))
        const el = await fixture(html`<rf-new-session-test></rf-new-session-test>`)

        const button = el.shadowRoot?.querySelector('button')

        expect(button).toBeTruthy()
        expect(button?.textContent).toContain('More')
    })

    it('should not show "More" button if number of summaries is <= 3', async () => {
        const summaries = [
            { id: '', generation: 1, lastRunOn: new Date() },
            { id: '', generation: 1, lastRunOn: new Date() },
            { id: '', generation: 1, lastRunOn: new Date() }
        ] as GeneticAlgorithmSummaryStore[]
        summarySpy.getRecent.and.returnValue(Promise.resolve(summaries))
        const el = await fixture(html`<rf-new-session-test></rf-new-session-test>`)

        const button = el.shadowRoot?.querySelector('button')

        expect(button).toBeFalsy()
    })

    it('should show all summaries if "More" button is clicked and then hide additional if clicked again', async () => {
        const summaries = [
            { id: '', generation: 1, lastRunOn: new Date() },
            { id: '', generation: 1, lastRunOn: new Date() },
            { id: '', generation: 1, lastRunOn: new Date() },
            { id: '', generation: 1, lastRunOn: new Date() }
        ] as GeneticAlgorithmSummaryStore[]
        summarySpy.getRecent.and.returnValue(Promise.resolve(summaries))
        const el = await fixture(html`<rf-new-session-test></rf-new-session-test>`)

        const button = el.shadowRoot?.querySelector('button')
        button?.dispatchEvent(new Event('click'))
        await elementUpdated(el)

        expect(el.shadowRoot?.querySelectorAll('.summary').length).toEqual(summaries.length)
        expect(button?.textContent).toContain('Less')

        button?.dispatchEvent(new Event('click'))
        await elementUpdated(el)

        expect(el.shadowRoot?.querySelectorAll('.summary').length).toEqual(3)
        expect(button?.textContent).toContain('More')
    })

    it('should have a links to /representatives/{id} for each summary', async () => {
        const summaries = [
            { id: 'a', generation: 1, lastRunOn: new Date() },
            { id: 'b', generation: 1, lastRunOn: new Date() },
            { id: 'c', generation: 1, lastRunOn: new Date() }
        ] as GeneticAlgorithmSummaryStore[]
        summarySpy.getRecent.and.returnValue(Promise.resolve(summaries))
        const el = await fixture(html`<rf-new-session-test></rf-new-session-test>`)

        const summaryEls = [ ...(el.shadowRoot?.querySelectorAll('.summary') || []) ]

        summaries.forEach(({ id }, i) => {
            const summaryEl = summaryEls[i]
            const anchor = summaryEl.querySelector('a') as HTMLAnchorElement

            expect(anchor.href).toMatch(new RegExp(`/representatives/${id}`))
        })
    })
})

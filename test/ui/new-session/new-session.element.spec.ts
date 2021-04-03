import { fixture } from '@open-wc/testing-helpers'
import { html } from 'lit-element'
import { OptionsTemplateService, OptionsTemplateSummary } from '../../../src/services/options-template.service'
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
    const templateSpy = jasmine.createSpyObj<OptionsTemplateService>('OptionsTemplateService', [ 'getRecent' ])

    beforeAll(() => {
        CustomElementRegistrar.instance.register(ContainerElementStub.is, ContainerElementStub)
        CustomElementRegistrar.instance.register(InsideContainerElementStub.is, InsideContainerElementStub)
        CustomElementRegistrar.instance.register(ButtonElementStub.is, ButtonElementStub)
        CustomElementRegistrar.instance.register(IconElementStub.is, IconElementStub)
        CustomElementRegistrar.instance.register(
            'rf-new-session-test',
            class extends NewSessionElement {
                constructor() { super(summarySpy, templateSpy) }
            })
    })

    beforeEach(async () => {
        summarySpy.getRecent.calls.reset()
        summarySpy.getRecent.and.returnValue(Promise.resolve([]))
        templateSpy.getRecent.calls.reset()
        templateSpy.getRecent.and.returnValue(Promise.resolve([]))
    })

    it('should retrieve all summaries from SummaryQueryService', async () => {
        await fixture(html`<rf-new-session-test></rf-new-session-test>`)

        expect(summarySpy.getRecent).toHaveBeenCalledWith()
    })

    it('should retrieve all templates from OptionsTemplateService', async () => {
        await fixture(html`<rf-new-session-test></rf-new-session-test>`)

        expect(templateSpy.getRecent).toHaveBeenCalledWith()
    })

    it('should render link to "/options/size"', async () => {
        const el = await fixture(html`<rf-new-session-test></rf-new-session-test>`)
        const anchor = el.shadowRoot?.querySelector('.new-container a') as HTMLAnchorElement

        expect(anchor.href).toMatch(/\/options\/size$/)
    })

    it('should not render "Templates" heading if no templates', async () => {
        const el = await fixture(html`<rf-new-session-test></rf-new-session-test>`)

        const heading = [ ...(el.shadowRoot?.querySelectorAll('h2') ?? []) ]
            .filter(el => el.textContent?.includes('Templates'))[0]

        expect(heading).toBeFalsy()
    })

    it('should not render "Past Sessions" heading if none', async () => {
        const el = await fixture(html`<rf-new-session-test></rf-new-session-test>`)

        const heading = [ ...(el.shadowRoot?.querySelectorAll('h2') ?? []) ]
            .filter(el => el.textContent?.includes('Past Sessions'))[0]

        expect(heading).toBeFalsy()
    })

    it('should render all summaries', async () => {
        const summaries = [
            { id: '', generation: 1, lastRunOn: new Date() },
            { id: '', generation: 1, lastRunOn: new Date() },
            { id: '', generation: 1, lastRunOn: new Date() },
            { id: '', generation: 1, lastRunOn: new Date() }
        ] as GeneticAlgorithmSummaryStore[]
        summarySpy.getRecent.and.returnValue(Promise.resolve(summaries))
        const el = await fixture(html`<rf-new-session-test></rf-new-session-test>`)

        const summaryEls = el.shadowRoot?.querySelectorAll('.summary')

        expect(summaryEls?.length).toEqual(summaries.length)
    })

    it('should render all templates', async () => {
        const templates: OptionsTemplateSummary[] = [
            { id: '', name: '', lastAccessedOn: new Date() },
            { id: '', name: '', lastAccessedOn: new Date() },
            { id: '', name: '', lastAccessedOn: new Date() },
            { id: '', name: '', lastAccessedOn: new Date() }
        ]
        templateSpy.getRecent.and.returnValue(Promise.resolve(templates))
        const el = await fixture(html`<rf-new-session-test></rf-new-session-test>`)

        const templateEls = el.shadowRoot?.querySelectorAll('.template')

        expect(templateEls?.length).toEqual(templates.length)
    })

    it('should have a link to /representatives/{id} for each summary', async () => {
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

    it('should have a links to /options/size/{id} for each template', async () => {
        const templates: OptionsTemplateSummary[] = [
            { id: 'a', name: '', lastAccessedOn: new Date() },
            { id: 'b', name: '', lastAccessedOn: new Date() },
            { id: 'c', name: '', lastAccessedOn: new Date() },
            { id: 'd', name: '', lastAccessedOn: new Date() }
        ]
        templateSpy.getRecent.and.returnValue(Promise.resolve(templates))
        const el = await fixture(html`<rf-new-session-test></rf-new-session-test>`)

        const templateEls = [ ...(el.shadowRoot?.querySelectorAll('.template') || []) ]

        templates.forEach(({ id }, i) => {
            const templateEl = templateEls[i]
            const anchor = templateEl.querySelector('a') as HTMLAnchorElement

            expect(anchor.href).toMatch(new RegExp(`/options/size/${id}`))
        })
    })
})

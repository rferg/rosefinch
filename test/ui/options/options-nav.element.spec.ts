import { elementUpdated, fixture } from '@open-wc/testing-helpers'
import { html } from 'lit-element'
import { StateMediatorService, StateTopic } from '../../../src/services/state'
import { OptionsNavElement } from '../../../src/ui/options/options-nav.element'
import { optionsRoutes } from '../../../src/ui/options/options-routes'
import { CustomElementRegistrar } from '../../helpers/custom-element-registrar'

describe('OptionsNavElement', () => {
    let el: OptionsNavElement
    let routeParamsListener: (p: { params: { [key: string]: number | string } }) => void
    const stateSpy = jasmine.createSpyObj<StateMediatorService>('StateMediatorService', [ 'subscribe' ])

    beforeAll(() => {
        CustomElementRegistrar.instance.register(
            'rf-options-nav-test',
            class extends OptionsNavElement {
                constructor() {
                    super(stateSpy)
                }
            })
    })

    beforeEach(async () => {
        stateSpy.subscribe.calls.reset()

        el = await fixture(html`<rf-options-nav-test></rf-options-nav-test>`)
        const [ topic, listener ] = stateSpy.subscribe.calls.mostRecent().args
        if (topic !== StateTopic.RouteParams) {
            throw new Error('Incorrect state topic')
        }
        routeParamsListener = listener
    })

    it('should create', () => {
        expect(el).toBeTruthy()
    })

    it('should render links for all routes', () => {
        const links = [ ...(el.shadowRoot?.querySelectorAll('a') ?? []) ]

        expect(links?.length).toEqual(optionsRoutes.length)
        optionsRoutes.forEach(({ path, label }) => {
            const link = links.find(l => l.href.includes(`/options/${path}`))
            expect(link).toBeDefined()
            expect(link?.textContent).toContain(label)
        })
    })

    it('should make link active according to sub route param', async () => {
        const subRoute = optionsRoutes[0].path

        routeParamsListener({ params: { sub: subRoute } })
        await elementUpdated(el)

        const activeLink = el.shadowRoot?.querySelector('li[data-active] a') as HTMLAnchorElement
        expect(activeLink).toBeTruthy()
        expect(activeLink.href).toContain(`/options/${subRoute}`)
    })

    it('should render links with templateId route param', async () => {
        const templateId = 'templateId'

        routeParamsListener({
            params: { templateId }
        })
        await elementUpdated(el)

        const links = [ ...(el.shadowRoot?.querySelectorAll('a') ?? []) ]
        expect(links?.length).toEqual(optionsRoutes.length)
        optionsRoutes.forEach(({ path }) => {
            const link = links.find(l => l.href.includes(`/options/${path}/${templateId}`))
            expect(link).toBeDefined()
        })
    })
})

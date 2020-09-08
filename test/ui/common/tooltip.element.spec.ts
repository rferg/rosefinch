import { TooltipElement } from '../../../src/ui/common/tooltip.element'
import { elementUpdated, fixture } from '@open-wc/testing-helpers'
import { html } from 'lit-element'

describe('TooltipElement', () => {

    beforeAll(() => {
        customElements.define('rf-tooltip-test', TooltipElement)
    })

    it('should not display text initially', async () => {
        const el = await fixture(html`<rf-tooltip-test></rf-tooltip-test>`)

        expect(el.getAttribute('show')).toBeNull()
    })

    it('should display text on button click', async () => {
        const text = 'test text'
        const el = await fixture(html`<rf-tooltip-test .text=${text}></rf-tooltip-test>`)

        const button = el.shadowRoot?.querySelector('button')
        if (!button) { throw new Error('button is missing') }
        button.click()
        await elementUpdated(el)

        expect(el.getAttribute('show')).not.toBeNull()
        expect(el.shadowRoot?.textContent).toContain(text)
    })

    it('should toggle show off on second button click', async () => {
        const text = 'test text'
        const el = await fixture(html`<rf-tooltip-test .text=${text}></rf-tooltip-test>`)

        const button = el.shadowRoot?.querySelector('button')
        if (!button) { throw new Error('button is missing') }
        button.click()
        await elementUpdated(el)
        button.click()
        await elementUpdated(el)

        expect(el.getAttribute('show')).toBeNull()
    })

    it('should toggle show off if click is outside element', async () => {
        const text = 'test text'
        const el = await fixture(html`<rf-tooltip-test .text=${text}></rf-tooltip-test>`)

        const button = el.shadowRoot?.querySelector('button')
        if (!button) { throw new Error('button is missing') }
        button.click()
        await elementUpdated(el)
        document.dispatchEvent(new Event('click', { composed: true }))
        await elementUpdated(el)

        expect(el.getAttribute('show')).toBeNull()
    })
})

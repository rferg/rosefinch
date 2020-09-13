import { fixture, html } from '@open-wc/testing-helpers'
import { ProgressBarElement } from '../../../src/ui/pipeline/progress-bar.element'
import { CustomElementRegistrar } from '../../helpers/custom-element-registrar'

describe('ProgressBarElement', () => {

    beforeAll(() => {
        CustomElementRegistrar.instance.register('rf-progress-bar-test', ProgressBarElement)
    })

    const cases: { percentage: number, expectedX: number }[] = [
        { percentage: 0, expectedX: 0 },
        { percentage: 25, expectedX: 25 / 100 },
        { percentage: 66, expectedX: 66 / 100 },
        { percentage: 100, expectedX: 1 }
    ]

    cases.forEach(({ percentage, expectedX }) => {
        it(`it should render transform with scale X: ${expectedX} given percentage ${percentage}`, async () => {
            const el: ProgressBarElement = await fixture(
                html`<rf-progress-bar-test percentage="${percentage}"></rf-progress-bar-test>`)
            const barEl = el.shadowRoot?.getElementById('bar')
            if (!barEl) { throw new Error('bar element missing') }

            expect(barEl?.getAttribute('style'))
                .toEqual(`transform: scale(${expectedX.toFixed(2)},1)`)
        })
    })
})

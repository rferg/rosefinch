import { SVGTemplateResult } from 'lit-element'
import { NotationComponent } from './notation-component'

export type RenderedNote = {
    requiredDefs: {
        [key in Partial<NotationComponent>]: SVGTemplateResult
    }
    template: SVGTemplateResult
    endX: number,
    originalNoteIndex: number
}

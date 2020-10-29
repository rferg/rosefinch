import { SVGTemplateResult } from 'lit-element'

export type RenderedNote = {
    template: SVGTemplateResult
    endX: number,
    originalNoteIndex: number
}

import { DenominatedNote } from './denominated-note'
import { RenderedNote } from './rendered-note'

export interface NoteRenderingOptions {
    note: DenominatedNote
    startX: number
    trebleLineYs: number[]
    bassLineYs: number[]
    previousNote?: RenderedNote
    noteClass?: string
}

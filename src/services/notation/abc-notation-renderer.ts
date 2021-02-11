import { AbcRenderOptions, renderAbc } from 'abcjs'
import { Injectable } from 'cewdi'

@Injectable()
export class AbcNotationRenderer {
    render(
        target: string | HTMLElement,
        abcNotation: string,
        options: AbcRenderOptions): void {
            renderAbc(target, abcNotation, options)
        }
}

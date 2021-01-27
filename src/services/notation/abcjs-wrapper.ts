import { renderAbc } from 'abcjs'
import { Injectable } from 'cewdi'

@Injectable()
export class AbcJSWrapper {
    render(
        target: string | HTMLElement,
        abcNotation: string,
        options: {
            add_classes?: boolean,
            responsive?: 'resize',
            oneSvgPerLine?: boolean,
            [key: string]: string | boolean | number | undefined | { [key: string]: string | number }
        }): void {
            renderAbc(target, abcNotation, options)
        }
}

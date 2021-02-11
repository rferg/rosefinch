declare module '*.svg' {
    const content: string
    export default content
}

// see https://paulrosen.github.io/abcjs/visual/render-abc-options.html#format
// to add more options later
declare module 'abcjs' {
    export function renderAbc(target: string | HTMLElement, abcNotation: string, options: AbcRenderOptions)

    export type AbcRenderOptions = {
        add_classes?: boolean,
        responsive?: 'resize',
        oneSvgPerLine?: boolean,
        clickListener?: AbcClickListener
    }

    export type AbcAnalysis = {
        line: number,
        measure: number,
        voice: number,
        staffPos: { top: number, height: number, zero: number }
    }

    export type AbcElement = {

    }

    export type AbcClickListener = (
        abcElement: AbcElement,
        tuneNumber: number,
        classes: string[],
        analysis: AbcAnalysis) => void
}

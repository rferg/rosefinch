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

    export type AbcElement = {
        abselem?: any,
        averagepitch?: number,
        duration?: number
        el_type?: string
        endBeam?: boolean
        endChar?: number,
        maxpitch?: number,
        minpitch?: number
        pitches?: any[]
        startChar?: number
    }

    export type AbcClickListener = (
        abcElement: AbcElement,
        tuneNumber: number,
        classes: string,
        analysis: any,
        drag: any) => void
}

declare module '*.svg' {
    const content: string
    export default content
}

// see https://paulrosen.github.io/abcjs/visual/render-abc-options.html#format
// to add more options later
declare module 'abcjs' {
    export function renderAbc(
        target: string | HTMLElement,
        abcNotation: string,
        options: {
            addClasses?: boolean,
            responsive?: 'resize',
            oneSvgPerLine?: boolean,
            [key: string]: string | boolean | number | { [key: string]: string | number }
        })
}

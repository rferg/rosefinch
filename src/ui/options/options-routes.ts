import { Route } from '../core/route'

interface LabeledRoute extends Route {
    label: string
}
export const optionsRoutes: LabeledRoute[] = [
    {
        path: 'size',
        elementName: 'rf-size-form',
        label: 'Size and Time'
    },
    {
        path: 'chord',
        elementName: 'rf-chord-fitness',
        label: 'Chords'
    },
    {
        path: 'scale',
        elementName: 'rf-scale-fitness',
        label: 'Scale'
    },
    {
        path: 'pitch-sequence-direction',
        elementName: 'rf-pitch-sequence-direction-fitness',
        label: 'Sequence Direction'
    },
    {
        path: 'rest-proportion',
        elementName: 'rf-rest-proportion-fitness',
        label: 'Rest Proportion'
    },
    {
        path: 'rhythmic-dispersion',
        elementName: 'rf-rhythmic-dispersion-fitness',
        label: 'Rhythmic Dipsersion'
    },
    {
        path: 'patterns',
        elementName: 'rf-repeated-sequences-fitness',
        label: 'Pitch Patterns'
    }
]

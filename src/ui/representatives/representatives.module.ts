import { getProviders as getPlaybackProviders } from '../../services/playback'
import { Module } from '../core/module'
import { EditRepresentativeElement } from './edit-representative.element'
import { RatingDisplayElement } from './rating-display.element'
import { RepresentativeElement } from './representative.element'
import { RepresentativesFitnessFormElement } from './representatives-fitness-form.element'
import { RepresentativesHeaderElement } from './representatives-header.element'
import { RepresentativesElement } from './representatives.element'

export default {
    providers: [
        ...getPlaybackProviders()
    ],
    elements: [
        {
            element: RepresentativesElement,
            name: 'rf-representatives'
        },
        {
            element: RepresentativesHeaderElement,
            name: 'rf-representatives-header'
        },
        {
            element: EditRepresentativeElement,
            name: 'rf-edit-representative'
        },
        {
            element: RepresentativeElement,
            name: 'rf-representative'
        },
        {
            element: RepresentativesFitnessFormElement,
            name: 'rf-representatives-fitness-form'
        },
        {
            element: RatingDisplayElement,
            name: 'rf-rating-display'
        }
    ]
} as Module

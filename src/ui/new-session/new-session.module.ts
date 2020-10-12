import { SummaryQueryService } from '../../services/summary-query-service'
import { Module } from '../core/module'
import { NewSessionElement } from './new-session.element'

export default {
    providers: [
        SummaryQueryService
    ],
    elements: [
        {
            element: NewSessionElement,
            name: 'rf-new-session'
        }
    ]
} as Module

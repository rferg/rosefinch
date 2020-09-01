import { Module } from '../core/module'
import { NewSessionElement } from './new-session.element'

export default {
    providers: [],
    elements: [
        {
            element: NewSessionElement,
            name: 'rf-new-session'
        }
    ]
} as Module

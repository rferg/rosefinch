import { Module } from '../core/module'
import { ContainerElement } from './container.element'
import { InsideContainerElement } from './inside-container.element'
import { IconElement } from './icon.element'
import { ButtonElement } from './button.element'
import { TooltipElement } from './tooltip.element'
import { getProviders as getStorageProviders } from '../../storage'
import { getProviders as getStateProviders } from '../../services/state'

export default {
    providers: [
        ...getStateProviders(),
        ...getStorageProviders()
    ],
    elements: [
        { name: 'rf-container', element: ContainerElement },
        { name: 'rf-inside-container', element: InsideContainerElement },
        { name: 'rf-icon', element: IconElement },
        { name: 'rf-button', element: ButtonElement },
        { name: 'rf-tooltip', element: TooltipElement }
    ]
} as Module

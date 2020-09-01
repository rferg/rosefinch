import { ModuleLoadConfig } from './module-load-config'
import { ModuleName } from './module-name'
import { Module } from './module'
import { RouterOutletElement } from './router-outlet.element'
import { Router } from './router'
import { ModuleLoader } from './module-loader'
import { ExplicitProvider } from 'cewdi'
import { moduleLoadConfigToken } from './module-load-config-token'
import { customElementRegistryToken } from './custom-element-registry-token'
import { globalEventTargetToken } from '../../common/global-event-target-token'
import { PageWrapper } from './page-wrapper'
import { AppElement } from './app.element'
import { FourOhFourElement } from './404.element'

const moduleLoadConfig: ModuleLoadConfig = {
    [ModuleName.Common]: {
        loader: () => import('../common/common.module')
    },
    // TODO: Replace placeholders.
    [ModuleName.Options]: {
        loader: () => Promise.resolve({ default: { elements: [], providers: [] } })
    },
    [ModuleName.Pipeline]: {
        loader: () => Promise.resolve({ default: { elements: [], providers: [] } })
    },
    [ModuleName.RepresentativeDisplay]: {
        loader: () => Promise.resolve({ default: { elements: [], providers: [] } })
    },
    [ModuleName.Audio]: {
        loader: () => Promise.resolve({ default: { elements: [], providers: [] } })
    }
}

export const rootModule: Module = {
    elements: [
        {
            element: AppElement,
            name: 'rf-app'
        },
        {
            element: RouterOutletElement,
            name: 'rf-router-outlet'
        },
        {
            element: FourOhFourElement,
            name: 'rf-404'
        }
    ],
    providers: [
        Router,
        ModuleLoader,
        new ExplicitProvider(moduleLoadConfigToken, moduleLoadConfig),
        new ExplicitProvider(customElementRegistryToken, window.customElements),
        new ExplicitProvider(globalEventTargetToken, window),
        PageWrapper
    ]
}

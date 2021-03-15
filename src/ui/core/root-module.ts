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
import { getProviders as getStateProviders } from '../../services/state'
import { timerToken } from './timer-token'
import { PendingElement } from './pending.element'
import { windowToken } from '../../common/window-token'

const moduleLoadConfig: ModuleLoadConfig = {
    [ModuleName.Common]: {
        loader: () => import('../common/common.module')
    },
    [ModuleName.NewSession]: {
        loader: () => import('../new-session/new-session.module'),
        parentModule: ModuleName.Common
    },
    [ModuleName.Options]: {
        loader: () => import('../options/options.module'),
        parentModule: ModuleName.Common
    },
    [ModuleName.Pipeline]: {
        loader: () => import('../pipeline/pipeline.module'),
        parentModule: ModuleName.Options
    },
    [ModuleName.Representatives]: {
        loader: () => import('../representatives/representatives.module'),
        parentModule: ModuleName.Pipeline
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
        },
        {
            element: PendingElement,
            name: 'rf-pending'
        }
    ],
    providers: [
        ...getStateProviders(),
        Router,
        ModuleLoader,
        new ExplicitProvider(moduleLoadConfigToken, moduleLoadConfig),
        new ExplicitProvider(customElementRegistryToken, window.customElements),
        new ExplicitProvider(globalEventTargetToken, window),
        new ExplicitProvider(timerToken, window),
        new ExplicitProvider(windowToken, window),
        PageWrapper
    ],
    routes: [
        {
            path: '/',
            elementName: 'rf-new-session',
            moduleName: ModuleName.NewSession
        },
        {
            path: '/options',
            elementName: 'rf-options',
            moduleName: ModuleName.Options
        },
        {
            path: '/run',
            elementName: 'rf-pipeline',
            moduleName: ModuleName.Pipeline
        },
        {
            path: '/representatives/:id',
            elementName: 'rf-representatives',
            moduleName: ModuleName.Representatives
        },
        {
            path: '*',
            elementName: 'rf-404'
        }
    ]
}

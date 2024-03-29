import '@abraham/reflection'
import { Route } from './ui/core/route'
import { startApp } from './ui/core/start-app'
import { rootModule } from './ui/core/root-module'
import { ModuleName } from './ui/core/module-name'

const routes: Route[] = [
    {
        path: '/',
        elementName: 'rf-new-session',
        moduleName: ModuleName.NewSession
    },
    {
        path: '/options/:sub/:templateId?',
        elementName: 'rf-options',
        moduleName: ModuleName.Options
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

window.onload = async () => {
    try {
        await startApp({
            rootModule,
            customElementRegistry: window.customElements,
            routes
        })
    } catch (error) {
        console.error(error)
    }
}

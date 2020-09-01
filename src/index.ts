import '@abraham/reflection'
import { Route } from './ui/core/route'
import { startApp } from './ui/core/start-app'
import { rootModule } from './ui/core/root-module'
import { ModuleName } from './ui/core/module-name'

const routes: Route[] = [
    {
        path: '/',
        elementName: 'div',
        moduleName: ModuleName.Common
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

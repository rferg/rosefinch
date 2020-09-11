import { Injectable } from 'cewdi'
import page from 'page'

@Injectable()
export class PageWrapper {
    start(): void {
        page.start()
    }

    register(path: string, callback: PageJS.Callback): void {
        page(path, callback)
    }

    navigate(path: string): void {
        page(path)
    }
}

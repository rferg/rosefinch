export class StateService<TState extends { [key: string]: any, [key: number]: any }> {
    private current?: TState
    private readonly listeners: ((state: TState | undefined) => void)[] = []

    constructor() {}

    update(updater: (currentState?: TState) => TState): TState | undefined {
        if (updater) {
            this.current = updater(this.getCurrent())
            this.callListeners()
        }
        return this.getCurrent()
    }

    getCurrent(): TState | undefined {
        return this.current === undefined ? undefined : { ...this.current }
    }

    addListener(listener: (state: TState | undefined) => void): void {
        if (listener && this.listeners.indexOf(listener) === -1) {
            this.listeners.push(listener)
        }
    }

    removeListener(listener: (state: TState | undefined) => void): void {
        const index = this.listeners.indexOf(listener)
        if (index !== -1) {
            this.listeners.splice(index, 1)
        }
    }

    private callListeners(): void {
        if (this.listeners && this.listeners.length) {
            const errors: any[] = []
            this.listeners.forEach(listener => {
                try {
                    listener(this.getCurrent())
                } catch (error) {
                    errors.push(error)
                }
            })

            if (errors.length) {
                errors.forEach(error => { throw error })
            }
        }
    }
}

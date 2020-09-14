export interface Timer {
    setTimeout(handler: TimerHandler, timeout?: number): number
    clearTimeout(handle?: number): void
}

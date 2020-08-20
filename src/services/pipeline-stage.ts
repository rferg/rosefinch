export interface PipelineStage<TState extends { [k: string]: any, [k: number]: any }> {
    execute(state?: TState): { cancel: () => Promise<void>, result: Promise<TState> }
    rollback(input?: TState, output?: TState): Promise<void>
}

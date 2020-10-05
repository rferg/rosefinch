export interface PlaybackCallbacks {
    onNoteChange?: (noteName: string, index: number, isDone: boolean) => any
}

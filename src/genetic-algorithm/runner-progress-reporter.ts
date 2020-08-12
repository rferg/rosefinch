export type RunnerProgressReporter = (report: {
    startingGeneration: number,
    currentGeneration: number,
    endingGeneration: number
}) => void

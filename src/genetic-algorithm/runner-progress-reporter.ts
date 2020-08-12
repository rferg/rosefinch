import { RunnerProgressReport } from './runner-progress-report'

export type RunnerProgressReporter = (report: RunnerProgressReport) => void

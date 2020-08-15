export function manhattanDistance(x: number[], y: number[]): number {
    if (x.length !== y.length) {
        throw new Error('Arrays must be of same length to calculate Manhattan Distance.')
    }
    return x.reduce((sum, xi, i) => sum + Math.abs(xi - y[i]), 0)
}

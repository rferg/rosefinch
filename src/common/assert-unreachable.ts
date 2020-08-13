export function assertUnreachable(_: never, errorMessage: string): never {
    throw new Error(errorMessage)
}

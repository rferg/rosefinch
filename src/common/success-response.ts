export interface SuccessResponse<T> {
    isSuccessful: boolean
    errorMessage?: string
    result?: T
}

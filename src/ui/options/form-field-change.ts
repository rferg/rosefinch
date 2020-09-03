export interface FormFieldChange {
    value: { [key: string]: any },
    isValid: boolean,
    errors?: string[]
}

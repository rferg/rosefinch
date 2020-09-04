export type FieldValidator = (value?: string | number) => { isValid: boolean, errors?: string[] }

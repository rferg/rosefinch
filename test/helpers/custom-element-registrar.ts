export class CustomElementRegistrar {
    private static _instance?: CustomElementRegistrar
    private readonly registrations = new Map<string, CustomElementConstructor>()

    static get instance(): CustomElementRegistrar {
        if (!CustomElementRegistrar._instance) {
            CustomElementRegistrar._instance = new CustomElementRegistrar()
        }
        return CustomElementRegistrar._instance
    }

    private constructor() { }

    register(name: string, constructor: CustomElementConstructor) {
        if (!this.registrations.has(name)) {
            this.registrations.set(name, constructor)
            window.customElements.define(name, constructor)
        } else {
            const existing = this.registrations.get(name)
            if (existing !== constructor) {
                throw new Error(`Attempted to register new element with existing name '${name}'.`)
            }
        }
    }
}

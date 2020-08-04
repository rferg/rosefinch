import { TestClass } from '../src'

describe('Test', () => {
    it('should say hello', () => {
        const x = new TestClass()
        expect(x.sayHello()).toBe('hello')
    })
})

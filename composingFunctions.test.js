// eslint-disable-next-line no-unused-vars
const _compose = (...funcs) => {
    if (!funcs.length) return (...args) => args[0]
    if (funcs.length === 1) return (...args) => funcs[0](...args)
    return (...args) => {
        let tempArgs = args
        return funcs.reverse().map(fn => {
            tempArgs = [fn(...tempArgs)]
            return tempArgs
        }).pop()[0]
    }
}

// eslint-disable-next-line no-unused-vars
const __compose = (...funcs) => {
    if (!funcs.length) return (...args) => args[0]
    if (funcs.length === 1) return (...args) => funcs[0](...args)
    return (...args) => {
        // at this point there are 2+ functions to be combined
        // whith starting accumulator value ommited first
        // iteration of reduce passes first and second function 
        // as 1st and 2nd args to the callback
        // two elements are taken into accout on first
        // iteration first loop will run with second
        // to last index
        return funcs.reduceRight((a, b, i) => (i === funcs.length - 2) ? b(a(...args)) : b(a))
    }
}

const compose = (...funcs) => {
    if (!funcs.length) return (...args) => args[0]
    if (funcs.length === 1) return (...args) => funcs[0](...args)
    return funcs.reduce((a, b) => {
        return function(...args) {
            let temp1 = b(...args)
            let temp2 = a(temp1)
            return temp2
        }
    })
}

const add5 = augend => augend + 5
const mult2 = multiplier => multiplier * 2
const sum = (...summands) => summands.reduce((a, c) => a + c)
const pow = (base, exponent) => base**exponent

describe('composing functions', () => {
    test('should return the same value as 3 nested functions', () => {
        const data = [1, 2, 3, 4, 5] 
        const composed = compose(add5, mult2, sum)
        expect(composed(...data)).toBe(add5(mult2(sum(...data))))
    })
    test('should return the same value as 1 nested function', () => {
        const data = [1, 2, 3, 4, 5] 
        expect(compose(sum)(...data)).toBe(sum(...data))
        expect(compose(pow)(2,4)).toBe(sum(pow(2,4)))
    })
    test('should return the first argument when composing 0 fns', () => {
        expect(compose()('whatever', 1)).toBe('whatever')
    })
})
---
layout: note.njk
title: Composing Functions
tags: 
 - note
---
Take any number of functions and return one that will be applied to passed arguments from right to left. Given functions `a`, `b`, `c` this:
```js
const abc = compose(a, b, c)
abc(1,2)
```
Is a more readable equivalent of:
```js
a(b(c(1,2)))
```
First test
---
I wrote a few simple functions operating on numbers:
```js
const add5 = augend => augend + 5
const mult2 = multiplier => multiplier * 2
const sum = (...summands) => summands.reduce((a, c) => a + c)
const pow = (base, exponent) => base**exponent
```
And a jest tests:
* composing 3 functions
* 1 function, wich returns early only calling the single function
* and 0 function variant which returns a function returning first passed argument
```js
describe('composing functions', () => {
    test('should return the same value as 3 nested functions', () => {
        const data = [1, 2, 3, 4, 5] 
        expect(compose(add5, mult2, sum)(data)).toBe(add5(mult2(sum(data))))
    })
    test('should return the same value as 1 nested function', () => {
        const data = [1, 2, 3, 4, 5] 
        expect(compose(sum)(data)).toBe(sum(data))
        expect(compose(pow)(2,4)).toBe(sum(pow(2,4)))
    })
    test('should return the first argument when composing 0 fns', () => {
        expect(compose()('whatever', 1)).toBe('whatever')
    })
})
```
First implementation
---
When passed more than 1 function it returns a function that:

* reverses the function array to apply functions `a(b(c(1,2)))` and not `c(b(a(1,2)))`
* maps funcions array saving intermediate return values in an array
* needs to be 'unpacked' before returning (`.pop()[0]`)

```js
const compose = (...funcs) => {
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
```
Saving intermediate values and returning only the accumulated, final value canbe done easier using `reduce`.

ReduceRight implementation
---
Reversing the `funcs` array can be avoided with `reduceRight` processing an array from back to front.  
Being able to compose functions accepting multiple arguments up front means operating on argument arrays. Call to the rightmost (1st) function uses spread operator `fn(...acc)`.
When `initialValue` is ommited `reduceRight` passes two last functions on first loop and starts from penultimate element (`funcs.length - 2`). First iteration applies both functions and spreads initial arguments.

```js
const compose = (...funcs) => {
    if (!funcs.length) return (...args) => args[0]
    if (funcs.length === 1) return (...args) => funcs[0](...args)
    return (...args) => {
        return funcs.reduceRight((a, b, i) =>
            (i === funcs.length - 2) ? b(a(...args)) : b(a))
    }
}
```
Redux implementation
---
Reduces `funcs` array and acumulates functions wrapping each new function in those already iterated over effectively reversing the calling order.  
It also shows that spreading an array just to return its first element `(...args) => args[0]` is redundant when `arg => arg` would do just that simply discarding all arguments but the first one.  
Wrapping single function and passing it its own argument should also be simplified `(...args) => funcs[0](...args)` to just `funcs[0]`.
```js
export default function compose(...funcs) {
  if (funcs.length === 0) {
    return arg => arg
  }

  if (funcs.length === 1) {
    return funcs[0]
  }

  return funcs.reduce((a, b) => (...args) => a(b(...args)))
}
```
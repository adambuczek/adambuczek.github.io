---
layout: note.njk
title: Polyfilling Bind
date: 2019-01-13
tags: 
 - note
 - javascript
published: false
---
JavaScript functions have a method called `bind`. It's used to bind `this` keyword to the provided function. It returns an [exotic object](http://www.ecma-international.org/ecma-262/6.0/#sec-exotic-object) that can't be bound again. `this` in returned function will always point to the value passed at the time of binding independently from new execution context.

```js
const data = 111
const fn = function() { console.log(this) }
const boundFn = fn.bind(data)

fn() // Window
boundFn() // 111
```

Polyfill
---
```js
describe('polyfiling bind', () => {
  it('customBind should properly bind passed context',
  () => {
    const data = { n: 111 }
    const fn = function fn() { 
      return this
    }
    expect(fn.customBind(data)())
      .to.equal(fn.bind(data)())
  })
  it('customBind should pass arguments to the bound function',
  () => {
    window.addend = 5
    const data = { addend: 111 }
    const fn = function(...args) {
      return args.reduce( (a,c) => a + c, this.addend)
    }
    expect(fn(1,2,3,4,5)).to.equal(20)
    expect(fn.customBind(data)(1,2,3,4,5))
      .to.equal(126)
    expect(fn.customBind(data)(1,2,3,4,5))
      .to.equal(fn.bind(data)(1,2,3,4,5))
  })
})
```
```js
// mocking polyfill
if (!Function.prototype.customBind) {
  Function.prototype.customBind = function() {
    var 
      // copy function (this) for reference in return value
      _this = this,
      thisValue,
      args = [];
    
    // fill args and thisValue from function passed arguments
    for (var i = 0; i < arguments.length; i++) {
      if (i) {
        args.push(arguments[i])
      } else {
        thisValue = arguments[i]
      }
    }
    return function() {
      // copy array-like aguments to be able to pass it
      // to concat as an array and call the bound
      // function passing this, bound arguments
      // and argumets passed to the bound
      // function call
      return _this.apply(
        thisValue,
        args.concat(
          Array.prototype.slice.call(arguments)
        )
      )
      
    }
  }
}
```

[On codepen.io](https://codepen.io/adambuczek/pen/KbrebO)
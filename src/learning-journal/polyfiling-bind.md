---
layout: note.njk
title: Polyfilling Bind
date: 2019-01-14
tags: 
 - note
 - javascript
published: true
---
JavaScript functions have a method called `bind`. It's used to bind `this`
keyword to the provided function. It returns an [exotic object](http://www.ecma-international.org/ecma-262/6.0/#sec-exotic-object)
that can't be bound again. `this` in returned function will always point
to the value passed at the time of binding independently from new execution context.

```js

const data = 111
const fn = function() { console.log(this) }
const boundFn = fn.bind(data)

fn() // Window
boundFn() // 111
```

Tests (mocha + chai)
---

Custom bound function should bind `this` value and properly handle arguments
passed at bind and on bound function execution.

```js
describe('custom bound function', function() {
  
  it(
    'should properly bind passed value as this in returned function',
    function () {
      const data = 111
      
      const fn = function() {
        // use strict mode to prevent `this` boxing
        'use strict'
        return this
      }
      const bound = fn.customBind(data)
    
      expect(bound()).to.equal(111)
  })
  
  window.addend = 5
  const data = { addend: 111 }
  const fn = function(...args) {
    return args.reduce( (a,c) => a + c, this.addend)
  }
  
  it(
    'should handle argumets passed to bound function',
    function() {    
      const customBound = fn.customBind(data)
      
      expect(fn(1,2,3,4,5)).to.equal(20)
      expect(customBound(1,2,3,4,5)).to.equal(126)
      expect(customBound(1,2,3,4,5))
        .to.equal(fn.bind(data)(1,2,3,4,5))
    })
  
  it(
    'should handle argumets passed on bind',
    function() {
      const customBound = fn.customBind(data, 1)
      
      expect(customBound(1,2)).to.equal(115)
      expect(customBound(1,2))
         .to.equal(fn.bind(data, 1)(1,2))
    })
})
```

Polyfill
---

Most important part of this polyfill is to create a copy of `this` at the beginning to call
it using `apply` in the returned function. Rest of the code makes sure the arguments passed
at binding and those passed ad execution are passed to the wrapped function.


```js
// mocking polyfill (ES5)
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
      // call slice on array-like Arguments
      var allArguments = args.concat(Array.prototype.slice.call(arguments))
      return _this.apply(thisValue, allArguments)
    }
  }
}
```
Comparing my solution with [MDN's polyfill](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind#Polyfill)
shows that it could be more concisely done using `Array.prototype.slice` on Arguments
to extract all but first elements instead of for loop.  
Also:
```js
args.push.apply(args, arguments)
```
Could be used in place of 
```js
var allArguments = args.concat(Array.prototype.slice.call(arguments))
```
As `push.apply()` works for passed array-like objects and also doesn't create
unnecessary copy of the array.

[On codepen.io](https://codepen.io/adambuczek/pen/KbrebO)
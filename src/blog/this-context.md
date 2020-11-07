---
layout: note.njk
title: "About `this`"
date: 2019-01-12
tags: 
 - note
 - javascript
published: true
excerpt: Showcase of what `this` means in given context. Difference between strict and sloppy modes.
image: /assets/about-this.png
---

`this` in JavaScript behaves differently based on current code context and execution mode.

Global functions
---

### Sloppy mode

In Node 10 regular function created in global scope has `this` pointing to global object. Arrow function created in the same context logs `{}`. The same set of cases in browser always gives the global `window`. This also applies to `this` inside an arrow function but not regular function.  

```js
// Node.js 10 / browser
console.log(this)
// {} / window

(function() { console.log(this) })()
// global / window

(() => { console.log(this) })()
// {} / window

(function() { 
    (function() { console.log(this) })()
    // global / window

    (() => { console.log(this) })()
    // global / window
    
})()

(() => { 
    (function() { console.log(this) })()
    // global / window

    (() => { console.log(this) })()
    // {} / window

})()
```

### Strict mode

Strict mode is more predictable as `this` is undefined in global scope.

```js
(function(){
    'use strict'

    console.log(this)
    // undefined

    (function() { console.log(this) })()
    // undefined

    (() => { console.log(this) })()
    // undefied

    (function() { 
        (function() { console.log(this) })()
        // undefined

        ;(() => { console.log(this) })()
        // undefined
    
    })()

    (() => { 
        (function() { console.log(this) })()
        // undefined

        (() => { console.log(this) })()
        // undefined

    })()
})()
```

Functions defined as object properties
---

### Sloppy mode

Arrow function points to global object because it was bound on creation time. Function bound on creation time behaves the same as arrow function. Regular function logs object because `this` is looked up at execution, if I remove it from object using `obj.returnFn()()` it no longer logs the object.

```js
const obj = {
    aaa: 111,
    bbb: 222,
    ccc: 333,
    _this: this,
    afn: () => console.log(this),
    bfn: (function bfn() { console.log(this) }).bind(this),
    fn: function fn() { console.log(this) },
    returnFn: function() { return this.fn },
    returnAfn: function() { return this.afn },
    returnBfn: function() { return this.bfn },
}

obj.afn() // {} / window
obj.bfn() // {} / window
obj.fn() // obj

obj.returnFn()() // global / window
obj.returnAfn()() // {} / window
obj.returnBfn()() // {} / window
```

### Strict mode

```js
(function(){
    'use strict'
    const obj = {
        aaa: 111,
        bbb: 222,
        ccc: 333,
        _this: this,
        afn: () => console.log(this),
        bfn: (function bfn() { console.log(this) }).bind(this),
        fn: function fn() { console.log(this) },
        returnFn: function() { return this.fn },
        returnAfn: function() { return this.afn },
        returnBfn: function() { return this.bfn },
    }
    
    obj.afn() // undefined
    obj.bfn() // undefined
    obj.fn() // obj
    
    obj.returnFn()() // undefined
    obj.returnAfn()() // undefined
    obj.returnBfn()() // undefined
})()
```

Function defined object type
---

### Sloppy and strict modes

Arrow function and regular function point to the same `this` value when called from an object's instance. If the constructor returned `this` directly (by default or explicitly). When a new object is returned and filled with `...this` arrow functions still points to the original function and can act as a static function.  
Function removed from parent object context lose `this` unless bound.

```js
function FunctionDefiedObjectType() {
    this.type = 'I am a function!'
    this.data = 111
    this.fn = function() { console.log(this) }
    this.afn = () => console.log(this)

    this.returnFn = function() { return this.fn }
    this.returnAfn = function() { return this.afn }

    return this
}

function FunctionDefiedObjectType2() {
    FunctionDefiedObjectType.apply(this)
    this.type = 'I am an extended function!'
    return {
        ...this
    }
}

const fdot = new FunctionDefiedObjectType()
const fdot2 = new FunctionDefiedObjectType2()

fdot.type = 'I am an instance!'
fdot2.type = 'I am a second instance!'

fdot.fn() // I am an instance!
fdot.returnFn()() // undefined

fdot.afn() // I am an instance!
fdot.returnAfn()() // I am an instance!

fdot2.fn() // I am a second instance!
fdot2.returnFn()() // undefined

fdot2.afn() // I am an extended function!
fdot2.returnAfn()() // I am an extended function!
```

Class
---

### Sloppy and strict modes

Class function properties and methods must be bound to class instance if they are to be used outside of class.

```js
class Class {
    constructor () {
        this.type = 'I am a constructor!'
        this.fn = function() { console.log(this) }
        this.afn = () => console.log(this)
        this.boundMethod = this.method.bind(this)
    }
    
    method () { console.log(this) }
    // method () => console.log(this) // this is currently illegal

    returnFn () { return this.fn }
    returnAfn () { return this.afn }
    returnMethod () { return this.method }
    returnBoundMethod () { return this.boundMethod }

    returnSpreadThis () {
        return {
            ...this
        }
    }
}

const classInstance = new Class()

classInstance.type = 'I am an instance!'

classInstance.returnFn()() // undefined
classInstance.returnAfn()() // instance
classInstance.returnMethod()() // undefined
classInstance.returnBoundMethod()() // instance

const classInstanceCopy = classInstance.returnSpreadThis()
// classInstanceCopy han no access to methods
classInstanceCopy.afn() // instance
classInstanceCopy.fn() // instance's `this` as an object (no methods)
classInstanceCopy.boundMethod() // instance
```
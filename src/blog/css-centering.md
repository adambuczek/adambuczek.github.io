---
layout: note.njk
title: "CSS Centering"
date: 2019-01-21
tags: 
 - note
 - css
published: true
codepen: https://codepen.io/adambuczek/pen/PVYrWr
excerpt: A collection of ways of XY centering content with CSS. This task was given to me during a job interview.
---

## Outdated: Table cell centering
Requires another wrapper if the `table-cell` wrapper needs to be centered too. Table cell needs explicit dimensions. 

```html
<div class="wrapper">
  <div class="table-cell">
    <div class="red-box unknown-dimensions"></div>
  </div>
</div>
```

```css
.table-cell {
  width: 400px;
  height: 400px;
  display: table-cell;
  vertical-align: middle
}

.table-cell .red-box {
  margin: auto;
}
```

## Outdated: Absolute position with negative margin
Centered child dimensions need to be known.

```html
<div class="wrapper">
  <div class="red-box absolute known-dimensions"></div>
</div>
```
```css
.wrapper {
  position: relative;
}

.absolute {
  position: absolute;
  top: 50%;
  left: 50%;
}

.known-dimensions {
  width: 100px;
  height: 100px;
}

.absolute.known-dimensions {
  margin-top: -50px;
  margin-left: -50px;
}
```

## Absolute position
Useful for supporting IE 9-11 and when wrapping element can't be flex or inline-flex for some reason.
Can be used on multiple children (they overlap).

```html
<div class="wrapper">
  <div class="red-box absolute unknown-dimensions"></div>
</div>
```
With styles above.
```css
.absolute.unknown-dimensions {
  transform: translate(-50%, -50%);
}
```

## Flexbox centering

```html
<div class="wrapper flex">
  <div class="red-box unknown-dimensions"></div>
</div>
```
```css
.flex {
  display: flex;
  justify-content: center;
  align-items: center;
}
```
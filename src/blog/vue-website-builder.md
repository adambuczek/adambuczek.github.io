---
layout: note.njk
title: Vue website builder
date: 2020-10-01
tags: 
 - draft
 - vue
 - javascript
published: false
excerpt: "An overview and introduction to a case study - building Vue based websites inside a Vue application."
image: /assets/builder.png
---

We needed to create an application that allows users to build simple web pages in two flavours:
 - only HTML and CSS files allowed
 - some interactivity is allowed (tabs, sliders, accordions etc.)

> For clarity the web pages that are the end product of the whole process will be referred to as *Pages* and their elements as *Modules*.

## The goals

- End users should be presented with an easy to use drag-and-drop interface.

- UI should allow users to edit the content in imported *Modules*: edit text (with and without formatting), add and change images etc.

- Users can rearrange *Modules* in edit view.

- *Pages* should be built from a library (or libraries) of *Modules* created by another team (or teams) with new created on request.

- CSS should not leak to or out of the main app.

- New *Modules* can be created in a matter of hours - making them available in the UI should not require whole app to be redeployed.

- Created *Pages* must be exportable into standalone HTML pages with an option of Java&nbsp;Script free version.

## Non-goals

- Users can't create modules themselves. Only compose *Pages* from existing modules.

- Not everything is editable. Only elements explicitly marked as editable can be accessed and changed by a user.

- Some aspects can never be changed eg. fonts and most of the typography is defined upfront for each module.

## The plan

System composed of 3 parts:

**Component Library(-ies)**
: Set of Vue components that accept custom data via props. Built in a way that allows loading them via HTTP.

**User Interface**
: A Vue based web app. A view where components can be put together into a *Page* and filled with data. Think [Guttenberg](https://wordpress.org/gutenberg/).

**Exporter**
: A Node server. This will export *Pages* as standalone web pages.

### Basic assumptions

After in depth analysis in search of possible problem areas I decided on a set of prerequisites:

**Modules in Component Libraries must adhere to a standard**
: Editable elements must be identifiable and accessible for UI to inject event handlers.

**UI and Exporter need a shared protocol**
: It has to fully express what the *Page* is. Data validation on both ends will greatly reduce hard to find bugs.

**UI and Exporter need to have access to the identical component libraries**
: UI will fetch modules in [UMD](https://github.com/umdjs/umd) form via HTTP. Exporter can do the same or install whole library in requested version.

**CLs, UI and Exporter need to share dependencies**
: We don't want to embed external libraries into CL modules.  
  *Firstly* this would ship external libraries (with their dependencies), eg. a third party gallery component, inside imported component and take away the chance for optimizing the package size in exporter.  
  *Secondly*, in case the module creation is outsourced we need to control what libraries are being used.

## Summary

In the next 3 posts I will describe specific elements of this system, both in depth and in insolation. I am going to explain how assumptions above were expressed in the code. I will end the whole series with another overview - how the design of the whole system influenced each of its parts, and what was done to avoid coupling the code too tightly.

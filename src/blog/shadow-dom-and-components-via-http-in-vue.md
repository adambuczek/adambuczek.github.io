---
layout: note.njk
title: ShadowDOM and components via HTTP in Vue 2
date: 2020-10-01
tags: 
 - note
 - vue
 - javascript
published: true
---

## The problem

We needed to create an application that allows users to build simple web pages in two flavours: 
 - only html and css files allowed
 - some interactivity is allowed (tabs, sliders, accordions)

The pages should be built from a library of modules created by another team (or teams) with new modules
created on request.

End users shouldn't have be presented with easy to use drag and drop interface.

> For clarity the pages that are the end product of the whole process will be addressed as **Pages**.

## The plan

This system needs to be composed of 3 subsystems:

- Component Library(-ies)  
  Set of Vue components that accept custom data via props.
- User Interface  
  A Vue based web app. A view where components can be put together into a Page and filled with data.
- Exporter  
  A Node server. This will export Pages as standalone web pages.

### Basic assumptions

This creates a set of rules we can decide on upfront:

- <u>Modules in Component Libraries must adhere to a standard.</u> Editable elements must be identifiable and accesible for UI
  to inject event handlers.
- <u>UI and Exporter need a shared protocol</u> that can fully express what the Page is.
- <u>UI and Exporter need to have access to the same component libraries in the same versions.</u>
- <u>CLs, UI and Exporter need to share dependencies.</u> We don't want to embed external libraries into CL modules.  
  Firstly this would ship external module (with its dependencies), eg. a third party gallery component, inside imported component and
  take away the chance for optimizing the package size in exporter.  
  Secondly, in case the module creation is outsourced we need to control what libraries are being used.

### Component Libraries
We decided to create a Vue component library which leverages Vue CLI `--library` build option as it did exactly what we wanted
with very little customization.

The components themselves need editable fields that can be edited via props. We created a boilerplate Component Library with
storybook configured for convenient development. Storybook stories can use knobs to make sure that everything that needs to be
editable is.

Vue CLI config doesn't allow for multiple entry/output pairs. We wanted to build components separately to request then independently at runtime.

To achieve this each components comes with its own `manifest.json` file which serves as a source of truth for component's metadata.

```json
// src/components/Description/manifest.json
{
  "displayName": "Description",
  "name": "description-component",
  "thumbnail": "./screenshot.png"
}
```

Display name and thumbnail are used to represent the component before it's fetched and registered. Name is used by the build process and by the component itself.
Names must always be hyphenated according to [Custom Element](https://html.spec.whatwg.org/multipage/custom-elements.html#custom-elements-core-concepts) spec and
[Vue style guide](https://vuejs.org/v2/style-guide/#Multi-word-component-names-essential).

```js
// src/components/Description/index.vue
import meta from './manifest.json'

export default {
  name: meta.name,
  props: {
    description: {
      type: String,
      default: 'description'
    },
  },
}
```

The build process happens in two steps
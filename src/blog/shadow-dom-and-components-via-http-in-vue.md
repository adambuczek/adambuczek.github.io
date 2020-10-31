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

We needed to create an application that allows non-technical users to build simple promotional pages in two flavours: 
 - static - only html and css files allowed
 - SPA - some interactivity is allowed (tabs, sliders, accordions)

The pages should be built from a library of modules created by another team (possibly more than one) with new modules
created on request.

End users shouldn't have to know any html, css or js to use the app.

## The plan

### Modules
We decided to create a Vue component library which leverages Vue CLI `--library` build option as it did exactly what we wanted
with very little customization.

The components themselves need editable fields that can be edited via props. We created a boilerplate Component Library with
storybook configured for convenient development.

Vue CLI config doesn't allow for multiple entry/output pairs. We wanted to build components separately to request then independently at runtime
without relying on tree-shaking.
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
Names are always hyphenated according to [Custom Element](https://html.spec.whatwg.org/multipage/custom-elements.html#custom-elements-core-concepts) spec and
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
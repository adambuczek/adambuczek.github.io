---
layout: note.njk
title: Async component library with Vue
date: 2020-10-02
tags: 
 - draft
 - vue
 - javascript
published: false
excerpt: Creating a Vue component library with multiple output files without ejecting Vue CLI setup.
image: /assets/building-vue-component-library.png
---
This is the first element of [Vue based website builder](../vue-website-builder) — a component library, source of *Modules* that can be loaded at runtime via HTTP when they are needed.

As stated earlier [Component Libraries must adhere to a standard](../vue-website-builder/#basic-assumptions). Lifecycle of a component looks like this:
- All accessible components are listed in the UI.
- A component is chosen from the list and added to a main area.
- Component's content can be edited; components can be rearranged.

To sum up — components must be listable, addable and editable in a standardized way. Here is how I have done it.

> An example library is available in [adambuczek/example-vue-component-library](https://github.com/adambuczek/example-vue-component-library).

## Standardization and metadata

To be referenced from the outside, each component needs an additional set of data attached to it. The data from all the components is later combined into library manifest listing all available *Modules*.

I decided on `manifest.json` file per component:

```json
{
  "displayName": "Page Title",
  "name": "page-title",
  "img": "thumb.png",
  "props": [ "text" ]
}
```

These files serve as a source of truth about each *Module* and are accessible from anywhere. They are also used in the components' `<script>`:

```js
import { name, props } from './manifest.json'

export default {
  name,
  props
}
```

This way the manifest alone provides almost all of the data needed to work with the *Module*. It doesn't contain the component itself but provides a way to access it.

Listable — `img` and `displayName` are mainly cosmetic and informational, and also represent the component in a user-friendly way.

Addable — `name` is what Vue sees internally and must always be hyphenated according to [Custom Element](https://html.spec.whatwg.org/multipage/custom-elements.html#custom-elements-core-concepts) spec and [Vue style guide](https://vuejs.org/v2/style-guide/#Multi-word-component-names-essential).

Editable — `props` list is used to create control elements that can inject the content into the component. I will talk about it in the next post.

Example standardized components looks like this in the directory tree:
```bash
src
├── components
│   ├── CaptionedImage
│   │   ├── index.vue
│   │   ├── manifest.json
│   │   └── thumb.png
│   ├── PageTitle
│   │   ├── index.vue
│   │   ├── manifest.json
│   │   └── thumb.png
│   └── ThreeColumnText
│       ├── index.vue
│       ├── manifest.json
│       └── thumb.png
```
Those are very simple but they can have any functionality a Vue 2 application can.

## Build process

Build process happens in 2 steps:

### Manifest

All components' manifests are gathered and joined into a single `manifest.json`. I used [fast-glob](https://www.npmjs.com/package/fast-glob) to find all manifests.

This step also takes care of copying component images to the output directory.

Full `create-manifest.js` script is [here](https://github.com/adambuczek/example-vue-component-library/blob/master/scripts/create-manifest.js).


### Build

Vue CLI config doesn't allow for multiple entry/output pairs. I wanted to build components separately to be able to request them independently at runtime. Build process uses generated `manifest.json` to identify entry files. This step also fills the manifest file with paths to compiled files relative to the manifest itself.

My solution is based on [Markus Oberlehner's article](https://markus.oberlehner.net/blog/distributed-vue-applications-loading-components-via-http/). He describes how to use Vue CLI to build a single component.

```bash
vue-cli-service build --target lib \
  --formats umd-min --no-clean \
  --dest outputDir --name componentName inputFilePath
```

Based on this I created a script that uses the data from the manifest file to trigger building multiple components in parallel. Full `build.js` script is [here](https://github.com/adambuczek/example-vue-component-library/blob/master/scripts/build.js).

Components in UMD format are exposed as global variables when executed in a browser, as long as Vue also is a global variable. [Markus](https://markus.oberlehner.net/blog/distributed-vue-applications-loading-components-via-http/) provides a pattern that leverages this property and I will [use it in the UI to register components](../building-vue-apps-in-vue-app/).

The manifest looks like this after the build step:

```json
{
  "name": "example-vue-component-library",
  "version": "0.1.0",
  "components": [
    {
      "displayName": "Captioned Image",
      "name": "captioned-image",
      "img": "captioned-image-thumb.png",
      "props": [
        "url",
        "alt",
        "caption"
      ],
      "src": "src/components/CaptionedImage/index.vue",
      "style": "captioned-image.css",
      "script": "captioned-image.umd.min.js",
      "map": "captioned-image.umd.min.js.map"
    },
    {
      "displayName": "Page Title",
      "name": "page-title",
      "img": "page-title-thumb.png",
      "props": [
        "text"
      ],
      "src": "src/components/PageTitle/index.vue",
      "style": "page-title.css",
      "script": "page-title.umd.min.js",
      "map": "page-title.umd.min.js.map"
    },
    {
      "displayName": "Three Column Text",
      "name": "three-column-text",
      "img": "three-column-text-thumb.png",
      "props": [
        "text"
      ],
      "src": "src/components/ThreeColumnText/index.vue",
      "style": "three-column-text.css",
      "script": "three-column-text.umd.min.js",
      "map": "three-column-text.umd.min.js.map"
    }
  ]
}
```
This is an actual entry point of this component library. This is a set of data that can fetch and use any component built here.

## Components server

For development a simple static files server will suffice. I am using `http-serve` via `npx`. It is defined in `package.json` as `serve-dist`:
```bash
npx http-serve --cors dist -p 8888
```
This serves dist directory on port 8888 with loose cors settings — in case the client app runs on a custom domain.

## Summary

Vue CLI via the power of UMD gives us a way of building independent Vue components. Right now its only a command line option but hopefully it is going to [change in the future](https://github.com/vuejs/vue-cli/issues/3922).

Apart from that Vue CLI configuration is very extensible and so is Vue Single File Components syntax. There is an example component library [Hello Vue Components](https://github.com/chrisvfritz/hello-vue-components) authored by Chris Fritz which illustrates a case where additional metadata is kept inside vue files. This idea is certainly worth exploring.

In the next part I will build an example app that uses the components created here straight from a static files server.
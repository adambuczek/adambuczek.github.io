---
layout: note.njk
title: Building Vue apps in Vue app
date: 2020-10-03
tags: 
 - draft
 - vue
 - javascript
published: false
excerpt: Building Vue app from async components loaded via HTTP. Using ShadowDOM to prevent styles to cross app boundaries.
image: /assets/building-vue-apps-in-vue-app.png
---

This is a second entry in [Vue based website builder](../vue-website-builder) series. A User Interface for creating web pages from prebuilt [Vue components](../building-vue-component-library).

## User Interface

### Importing components asynchronously

With component libraries prepared the way [described earlier](../building-vue-component-library) I can now use a pattern [created by Markus Oberlehner](https://markus.oberlehner.net/blog/distributed-vue-applications-loading-components-via-http/) to import components from a running static server. I load the external `manifest.json` file and render a list of available components as draggable UI elements allowing users to build with them.

When a component gets dropped into the main area `loadExternalComponent.js` takes care of making it avaliable to Vue as an [async component](https://vuejs.org/v2/guide/components-dynamic-async.html#Async-Components).

(Code from [here](https://markus.oberlehner.net/blog/distributed-vue-applications-loading-components-via-http/) with my comments.)

```js
// loadExternalComponent.js
export default async function externalComponent(url) {
  const name = url.split('/').reverse()[0].match(/^(.*?)\.umd/)[1]

   // The registered component will be a global object.
  if (window[name]) return window[name]

   // We save a promise where the component will be in the future
   // to prevent from fetching it multiple times.

  window[name] = new Promise((resolve, reject) => {

     // Create new <script> element and add resolve and reject on
     // load and error events.
  
    const script = document.createElement('script')
    script.async = true

    script.addEventListener('load', () => {
  
       // This seems like we were trying to resolve the promise with
       // itself which wouldn't work but when the load event fires
       // window[name]'s value is already a Vue component.
    
      resolve(window[name])
    })

    script.addEventListener('error', () => {
      reject(new Error(`Error loading ${url}`))
    })

    script.src = url
    document.head.appendChild(script)
  })

  return window[name]
}
```

Code above works as expected thanks to [Vue CLI Library target](https://cli.vuejs.org/guide/build-targets.html#library) option used back when components were built. In short it depends on Vue being globally available and registers the component as `window[component-name]` by webpack's UMD implementation.

This is exactly why the promise resolves to the loaded component. Amazing pattern.

This way multiple component libraries may be used without over-bloating the app. Updates in libraries doesn't require the UI to be rebuilt and redeployed.

### Mounting components in isolation

Imported components' styles need to be separated from the rest of the app. They need to be editable and reorderable. I mount them into new instances of Vue inside [ShadowDOM](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM) root. CSS styles are injected next to new app root.

To achieve this components are wrapped in ListItem that creates a single component Vue app on mount. Initial, empty props (declared in the manifest) are passed to ensure their reactivity later.

```js
const ListItem = {
  name: 'list-item',
  props: {
    component: Object,
    data: Object
  },
  render: h => h('div', { ref: 'host' }),
  mounted () {
    const host = this.$refs.host
    
    const component = () =>
      loadExternalComponent(this.component.script)

    const render = h => h(component, {
      style: { border: '1px dotted red' },
      props: { ...this.data }
    })

    const shadowRoot = host.attachShadow({ mode: 'open' })
    const shadowApp = document.createElement('div')

    /** Load Styles */
    const shadowStyle = document.createElement('link')
    shadowStyle.href = this.component.style
    shadowStyle.rel = 'stylesheet'

    shadowRoot.appendChild(shadowApp)
    shadowRoot.appendChild(shadowStyle)
    new Vue({
      render
    }).$mount(shadowApp)
  }
}
```

Those ListItems are rendered inside a dragabble list and can be reordered. I used [Vue.Draggable](https://github.com/SortableJS/Vue.Draggable) for to create the drag and drop interface.

#### Editing Data

Manifest contains a list of available [props for each component](../building-vue-component-library#standardization-and-metadata) which I use to to create an input for each prop. For simplicity all props receive strings now but they can be virtually anything.

#### Exporting data

Once the *Page* is complete it can be represented in a JSON form and saved or exported. It could look like this:

```json
{
  "components": [
    {
      "name": "description-component",
      "data": {
        "text": "Lorem ipsum dolor sit, amet, consectetur, adipisci elit"
      },
      "order": 0
    }
  ]
}
```
This data structure can be sent to an exporter which I am going to describe in the next part.

## Summary

Web app building web app is ready. Although it lacks polish I can now create a simplistic web pages from parts I prepared earlier. The modules are also uncomplicated and lack interactivity but remember that we have whole functionality of Vue 2 to work with — this fact lets us create a system as robust as needed to be used with no knowledge of web development.

Next time I am going to build a Node backend that uses a custom webpack configuration to process JSON data into standalone websites and serve a preview.

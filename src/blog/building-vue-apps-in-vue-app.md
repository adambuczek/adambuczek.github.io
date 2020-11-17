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

Earlier I made [some assumptions](../vue-website-builder/#basic-assumptions) about how the UI should work.

### User Interface

App where components can be put together into a Page and filled with data.

#### Importing components asynchronously

With component libraries prepared in the way [described earlier](../building-vue-component-library) I can now use a pattern [created by Markus Oberlehner](https://markus.oberlehner.net/blog/distributed-vue-applications-loading-components-via-http/) to import components from a running static server.

I load the external `manifest.json` file and get the components list. This is used to render a list of available components and create UI elements allowing users to load them at runtime. When a component gets dropped into the main area `loadExternalComponent.js` takes care of making it avaliable as an [async component](https://vuejs.org/v2/guide/components-dynamic-async.html#Async-Components).

(Code copied straight from [here](https://markus.oberlehner.net/blog/distributed-vue-applications-loading-components-via-http/) with my comments.)

```js
// loadExternalComponent.js
export default async function externalComponent(url) {
  const name = url.split('/').reverse()[0].match(/^(.*?)\.umd/)[1]

   // The registered component will be a global object.
   // Window[component] serves as a component cache — each is
   // loaded once, when it is first used. 
  if (window[name]) return window[name]

   // We save a promise where the component will be in the future.
   // This prevents multiple promises to be created.

  window[name] = new Promise((resolve, reject) => {

     // Create new script element and add resolve and reject on
     // load and error events.
  
    const script = document.createElement('script')
    script.async = true

    script.addEventListener('load', () => {
  
       // This seems like we were trying to resolve the promise with
       // itself which wouldn't work but when the load event fires
       // window[component]'s value is already a working Vue
       // component only not yet registered.
    
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

Code above works as expected thanks to [Vue CLI Library target](https://cli.vuejs.org/guide/build-targets.html#library)option used when building the components. In short it depends on Vue being globally available and is registered as `window[component-name]` by webpack's UMD implementation.

This is exactly why the promise resolves to the loaded component. Amazing pattern.

This way multiple large may be used without over-bloating the app. Updates in libraries doesn't need the UI to be rebuilt and redeployed.

#### Mounting components in isolation

Imported components' styles need to be separated from the rest of the app. They need to be editable and reorderable. To achieve this requirements I mount them into new instances of Vue inside ShadowDOM root. CSS styles are injected next to new app root.

Imported components are wrapped in the ListItem component that on mount creates additional Vue apps.

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
    const component = () => loadExternalComponent(this.component.script)
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

#### Editing Data

Editing data uses additional widgets to inject props into added components.

#### Exporting data

Once the Page is complete it can be represented in a JSON form and saved or exported.

```json
{
  "name": "example-page",
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

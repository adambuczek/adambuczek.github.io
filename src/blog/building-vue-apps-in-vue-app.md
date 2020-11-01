---
layout: note.njk
title: Building Vue apps in Vue app
date: 2020-10-03
tags: 
 - note
 - vue
 - javascript
published: false
excerpt: Building Vue app from async components loaded via HTTP. Using ShadowDOM to prevent styles to cross app boundaries.
---

### User Interface

App where components can be put together into a Page and filled with data.

#### Importing components asynchronously

With component libraries prepared in the way described above there are two ways
of registering and using components in UI.
- installing with NPM
- importing via HTTP

Independently from chosen way we may now load the exported `manifest.json` file and get the component metadata list. This can be used to render a list of available components and create UI elements allowing users to add components at runtime.

Component source files can be imported [asynchronously](https://vuejs.org/v2/guide/components-dynamic-async.html#Async-Components) and cached. This way multiple large libraries may be used without over-bloating built app.

Imported components' styles need to be separated from the rest of the app. They need to be editable and reorderable. To achieve this requirements we import components asynchronously and mount them into new instances of Vue that are mounted inside ShadowDOM root. CSS styles are injected next to new app root.

#### Editing Data

Editing data uses additional widgets to inject props into added components. This works with a directive added to the component at development time.

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

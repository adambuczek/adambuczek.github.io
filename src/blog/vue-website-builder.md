---
layout: note.njk
title: Vue website builder
date: 2020-10-01
tags: 
 - note
 - vue
 - javascript
published: true
---

We needed to create an application that allows users to build simple web pages in two flavours
 - only html and css files allowed
 - some interactivity is allowed (tabs, sliders, accordions etc.)

> For clarity the pages that are the end product of the whole process will be referred to as **Pages**.

## The goals

- End users should be presented with easy to use drag and drop interface. No technical skills required.

- UI should let users edit imported modules content: edit text (with and without formatting), add and change images.

- Users can rearrange modules in edit view.

- The pages should be built from a library (or libraries) of modules created by another team (or teams) with new modules created on request.

- Modules' CSS should not leak to the main app and vice versa.

- New modules can be created in a matter of hours - making them available in the UI should not require whole app to be redeployed.

- Created Pages must be exportable into standalone HTML pages with the option of Java&nbsp;Script free version.

## Non-goals

- Users can't create modules themselves. Only compose Pages from existing ones.

- Only parts explicitly marked as editable can be changed.

- Some aspects can never be changed eg. fonts and most of the typography is defined upfront for each module.

## The plan

This system needs to be composed of 3 subsystems.

**Component Library(-ies)**
: Set of Vue components that accept custom data via props. Built in a way that allows loading them via HTTP.

**User Interface**
: A Vue based web app. A view where components can be put together into a Page and filled with data.

**Exporter**
: A Node server. This will export Pages as standalone web pages.

### Basic assumptions

This creates a set of rules we can decide on upfront.

**Modules in Component Libraries must adhere to a standard**
: Editable elements must be identifiable and accessible for UI to inject event handlers.

**UI and Exporter need a shared protocol**
: It has to fully express what the Page is.

**UI and Exporter need to have access to the identical component libraries.**
: CLs must be installable, version controlled and accessible via HTTP. 

**CLs, UI and Exporter need to share dependencies.**
: We don't want to embed external libraries into CL modules.  
  Firstly this would ship external module (with its dependencies), eg. a third party gallery component, inside imported component and take away the chance for optimizing the package size in exporter.  
  Secondly, in case the module creation is outsourced we need to control what libraries are being used.



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

### Exporter

The exporter is a stateless express server that accepts JSON representation of a Page and transpiles it with webpack into prerendered HTML file with scripts and styles inlined.

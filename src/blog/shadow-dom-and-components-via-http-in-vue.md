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

We needed to create an application that allows users to build simple web pages in two flavours
 - only html and css files allowed
 - some interactivity is allowed (tabs, sliders, accordions)

The pages should be built from a library of modules created by another team (or teams) with new modules
created on request.

End users shouldn't have be presented with easy to use drag and drop interface.

> For clarity the pages that are the end product of the whole process will be addressed as **Pages**.

## The plan

This system needs to be composed of 3 subsystems.

Component Library(-ies)
: Set of Vue components that accept custom data via props.

User Interface
: A Vue based web app. A view where components can be put together into a Page and filled with data.

Exporter
: A Node server. This will export Pages as standalone web pages.

### Basic assumptions

This creates a set of rules we can decide on upfront.

Modules in Component Libraries must adhere to a standard
: Editable elements must be identifiable and accessible for UI to inject event handlers.

UI and Exporter need a shared protocol
: It has to fully express what the Page is.

UI and Exporter need to have access to the same component libraries in the same versions.
: CLs must be installable and version controlled and accessible via HTTP.

CLs, UI and Exporter need to share dependencies.
: We don't want to embed external libraries into CL modules.
: Firstly this would ship external module (with its dependencies), eg. a third party gallery component,
  inside imported component and take away the chance for optimizing the package size in exporter.
: Secondly, in case the module creation is outsourced we need to control what libraries are being used.

### Component Libraries
We decided to create a Vue component library which leverages Vue CLI `--library` build option as
it did exactly what we wanted with very little customization.

The components themselves need editable fields that can be edited via props. We created a boilerplate
Component Library with storybook configured for convenient development. Stories can use knobs
to make sure that everything that needs to be editable is.

Vue CLI config doesn't allow for multiple entry/output pairs. We wanted to build components
separately to request then independently at runtime.

#### Build process

To achieve this each components comes with its own `manifest.json` file which serves as
a source of component's metadata.

```json
// src/components/Description/manifest.json
{
  "displayName": "Description",
  "name": "description-component",
  "thumbnail": "./screenshot.png"
}
```

Display name and thumbnail are used to represent the component before it's fetched and registered.
Name is used by the build process and by the component itself. Names must always be hyphenated according
to [Custom Element](https://html.spec.whatwg.org/multipage/custom-elements.html#custom-elements-core-concepts)
spec and [Vue style guide](https://vuejs.org/v2/style-guide/#Multi-word-component-names-essential).

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

The build process happens in two steps.

First collects all the component metadata and joins it into a single
JSON. [Fast glob](https://github.com/mrmlnc/fast-glob) is used to find
and iterate over all modules, copy the thumbnail to output path, update its
url and save a path of main component entry file for use in actual build step.

```js
const fs = require('fs')
const path = require('path')
const fg = require('fast-glob')

const ensureDirectory = directory => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory)
  }
}

const copyThumbnail = (componentDir, thumbnail, name) => {
  const imgInputPath = path.resolve(componentDir, thumbnail)
  const newFilename = `${name}-${path.basename(thumbnail)}`
  const imgOutputPath = path.resolve(OUTPUT_PATH, newFilename)
  
  fs.copyFileSync(imgInputPath, imgOutputPath)
  // Windows compatibility: Replace possible '\'
  return imgOutputPath.replace(/\\/g, '/')
}

const OUTPUT_DIR = 'dist'
const PACKAGE_PATH = path.resolve('package.json')
const OUTPUT_PATH = path.resolve(OUTPUT_DIR)

const packageMetadata = require(PACKAGE_PATH)

const manifest = {
  name: packageMetadata.name,
  version: packageMetadata.version,
  components: []
}

const componentManifests = fg.sync('src/components/**/manifest.json')

ensureDirectory(OUTPUT_PATH)

componentManifests.forEach(manifestPath => {
  const componentDir = path.dirname(manifestPath)
  const componentManifest = require(path.resolve(manifestPath))
  const { name, thumbnail } = componentManifest

  componentManifest.thumbnail =
    copyThumbnail(componentDir, thumbnail, name)
  componentManifest.src =
    manifestPath.replace('manifest.json', 'index.vue')

  manifest.components.push(componentManifest)
})

const manifestOutputPath = path.resolve(OUTPUT_PATH, 'manifest.json')

fs.writeFileSync(
  manifestOutputPath,
  JSON.stringify(manifest, null, 2)
)
```

This creates a basic library manifest with exported thumbnail path thats relative to
manifest file. Additionally component entry file is listed in `src` field. This
is used in next step.

```json
{
  "name": "component-library-boilerplate",
  "version": "0.0.1",
  "components": [
    {
      "displayName": "Description",
      "name": "description-component",
      "thumbnail": "description-component-screenshot.png",
      "src": "src/components/Description/index.vue"
    }
  ]
}
```
Second step uses the created manifest to build components with Vue CLI. There is no
public Node API so we use `exec` to execute multiple build processes in parallel. And 
pass `src` and `name` for each component.

```js
const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')

const OUTPUT_DIR = 'dist'
const OUTPUT_PATH = path.resolve(OUTPUT_DIR)

const manifestPath = path.resolve(OUTPUT_PATH, 'manifest.json')
const manifest = require(manifestPath)

const createLogger = (label = '') =>
  data => console.log(`${label}: ${data.toString()}`)

const createBuildCommand = (input, output) => {
  const command = [
    'npx', 'vue-cli-service', 'build',
      '--target', 'lib',
      '--formats', 'umd-min',
      '--no-clean',
      '--dest', OUTPUT_PATH,
      '--name', input,
      output
  ]
  
  return command.join(' ')
}

const stdoutLog = createLogger('stdout')
const stderrLog = createLogger('stderr')

const components = manifest.components.slice()

manifest.components = []

components.forEach(component => {
  const input = component.src
  const output = component.name

  const command = createBuildCommand(output, input)
  
  try {
    const buildProcess = exec(command, (error, stdout, stderr) =>
      if (error) throw error
      stderrLog(stderr)
      stdoutLog(stdout)
    )
    buildProcess.stdout.on('data', stdoutLog)
    buildProcess.stderr.on('data', stderrLog)
  } catch (error) { 
    console.error(error)
    process.exit(1)
  }

  const [ style, script, map ] = [
    'css',
    'umd.min.js',
    'umd.min.js.map'
  ].map(extension => `${component.name}.${extension}`)

  manifest.components.push({
    ...component,
    style, script, map
  })
})

fs.writeFileSync(
  manifestPath,
  JSON.stringify(manifest, null, 2)
)
```
This setup along with proper `files` field setting in `package.json` lets us install
this package in another app and import components when they are needed.

### User Interface

App where components can be put together into a Page and filled with data.

#### Importing components asynchronously

With component libraries prepared in the way described above there are two ways
of registering and using components in UI.
- installing with NPM
- importing via HTTP

Independently from chosen way we may now load the exported `manifest.json` file and
get the component metadata list. This can be used to render a list of available
components and create UI elements allowing users to add components at runtime.

Component source files can be imported [asynchronously](https://vuejs.org/v2/guide/components-dynamic-async.html#Async-Components)
and cached. This way multiple large libraries may be used without over-bloating
built app.

Imported components' styles need to be separated from the rest of the app. They
need to be editable and reorderable. To achieve this requirements we import
components asynchronously and mount them into new instances of Vue that are mounted
inside ShadowDOM root. CSS styles are injected next to new app root.

#### Editing Data

Editing data uses additional widgets to inject props into added components. This
works with a directive added to the component at development time.

#### Exporting data

### Exporter

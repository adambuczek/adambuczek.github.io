---
layout: note.njk
title: Vue app packing service
date: 2020-10-04
tags: 
 - note
 - vue
 - javascript
 - node
 - webpack
published: false
excerpt: On demand webpack SSR builds with configuration factory.
---

### Exporter

The exporter is a stateless express server that accepts JSON representation of a Page and transpiles it with webpack into prerendered HTML file with scripts and styles inlined.
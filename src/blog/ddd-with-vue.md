---
layout: note.njk
title: Domain-driven architecture in&nbsp;Vue&nbsp;apps
date: 2020-05-01
tags: 
 - note
published: false
excerpt: "Post-mortem of a long process of applying elements of domain-driven design into a front end app ecosystem."
---

An app we were building started to grow and become unmanageable. A decision was made to split it into multiple smaller apps in one ecosystem. All shared backend. After a while the team started noticing problems. We were solving the same  problems over and over. Adding new features became very slow. Tasks was impossible to estimate and each sprint ended with frustration and delays.

UI state was mixed with data and distributed over multiple Vuex modules, some of it was duplicated. There was no consistency between different components, no  clear rules to decide what belongs in a component and no place for things that should not be there. This lack of organization quickly created a huge technical debt.

We started extracting shared components into Vue plugins. That helped a lot but didn't help with the rest of the apps' structure.

## The goals




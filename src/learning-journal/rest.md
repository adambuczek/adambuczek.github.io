---
layout: note.njk
title: REST
date: 2019-01-16
tags: 
 - note
 - backend
published: false
---

## Representational State Transfer.
It is called that way because it operates on state representations not depending on persistent state itself.
It is a very popular style of organizing web services.

## Properties
It is an uncomplicated and uniform way to manipulate data over the network.
Being stateless makes it easily scalable, modifiable and portable.

HTTP services created according to this standard typically use HTTP methods mapped to CRUD operations.

- `POST` for create
- `GET` for read
- `PATCH` for update
- `DELETE` for delete  
- and additionally `PUT` for replace

## Constraints[^1]
- Client-server separation   
It allows to separate client from server logic which let them grow based on their own needs.

- Statelessness  
No client context is stored on the server, session storage is held in the client. Each request contains all the information needed to service it.

- Cacheability  
Client may cache the responses. Responses may indicate if they should and shouldn't be cached.

- Layered System  
Client doesn't care if it's connected directly to the server as long as it gets the requests. This enables service scaling and portability or can enforce security.

- Code on Demand  
Servers can temporarily extend client functionality by serving client executable code.

- Uniformity  
Further decouples client and server architecture.  
Type of resource can be identified by looking at a request. Web resources are typically served at URLs identifying them e.g.: `/users/`.  
Client side session data is enough to modify a remote resource. When reading the resource clients gets all the data required to manipulate it.  
Accessing base API URL should provide the user with links to discover all related actions and resources. Making it traversable as directory structure or a regular web page.

[^1]: From REST Architectural constraints on [Wikipedia](https://en.wikipedia.org/wiki/Representational_state_transfer#Architectural_constraints).
---
layout: note.njk
title: Iframe Security
date: 2019-01-07
tags: 
 - note
 - iframe
published: true
---
You have no control over sites that provide their functionality via embedded frames. 3rd party providers who offer their functionality for free usually gather user data to be sold to ad providers as a form of *payment*.

Cross-origin Frames
---
Modern browsers are non susceptible to cross-origin `iframes` tampering with embedding website. 

This cross-origin frame doesn't have access to `top` frame which is the current website:

> Cross-origin frames may stop working at some point. Source used can be found at the [bottom of this page](#cross-origin-frame-source).

<iframe
  height="336"
  class="dotted-border"
  src="https://dev.adambuczek.com/iframe/"
  style="width: 100%;"></iframe>

Opening this frame with provided button will show that it does have access to `opener` which is the `iframe` itself but it still can't access `opener.top`. Trying to change location of `opener.top` in newly opened window will produce an error. This fact prevents changing location of original site in the background which could be used in a phishing attack.

Same-origin Frames
---
For comparison same-origin `iframe` below (identical to the one above) has access to `top`. Widow opened with provided button has access to `opener.top` and can change location of `top` frame of its `opener`. Clicking the button in newly opened window will change location of current site to example.com.

<iframe
  height="336"
  class="dotted-border"
  src="/iframe/"
  style="width: 100%;"></iframe>

Sandboxing
---
The [`sandbox`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe#attr-sandbox) attribute allows for extra restrictions. Empty attribute will apply all restrictions. 

### Same-origin Sandboxing

In this case same-origin sandboxed frame without `allow-same-origin` always fails SOP checks. This will also disable to `opener` in window opened in new tab.

<iframe
  height="336"
  class="dotted-border"
  sandbox="allow-scripts allow-popups"
  src="/iframe/"
  style="width: 100%;"></iframe>

Removing `allow-popups` will disable opening new windows and tabs.

<iframe
  height="336"
  class="dotted-border"
  sandbox="allow-scripts"
  src="/iframe/"
  style="width: 100%;"></iframe>

Removing `allow-scripts` disables all JavaScript but not popups. `target="_blank"` anchor will work, opened window will inherit script restriction. In this case frame will be mostly empty.

<iframe
  height="336"
  class="dotted-border"
  sandbox="allow-popups"
  src="/iframe/"
  style="width: 100%;"></iframe>

Adding `allow-popups-to-escape-sandbox` to the last case will allow script execution and `opener.top` access.

<iframe
  height="336"
  class="dotted-border"
  sandbox="allow-popups allow-popups-to-escape-sandbox"
  src="/iframe/"
  style="width: 100%;"></iframe>

### Cross-origin Sandboxing

Omitting `allow-same-origin` on cross-origin `iframe` blocks `opener` in popups.

<iframe
  height="336"
  class="dotted-border"
  src="https://dev.adambuczek.com/iframe/"
  sandbox="allow-scripts allow-popups"
  style="width: 100%;"></iframe>

<a id="cross-origin-frame-source">

### Cross origin frame source

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Document</title>
</head>
<body>
  <a href="" target="_blank">open this frame in blank target</a>
  <ul id="log"></ul>
  <script type="text/javascript">

    const logEl = document.getElementById('log')
    const log = (...messages) => {
      const messageEl = document.createElement('li')
      messageEl.style.display = 'flex'
      messageEl.style.borderTop = '1px solid black'
      messageEl.style.padding = '1rem 0'
      const spans = messages.map(message => {
        const span = document.createElement('span')
        span.style.flex = `${100 / messages.length}%`
        span.textContent = message
        messageEl.append(span)
      })
      logEl.append(messageEl)
    }
    logEl.style.padding = 0
    logEl.style.margin = 0

    const tryToReadWidowProp = str => {
      try {
        const path = str.split('.')
        result = path.reduce((a, c) => a[c], window)
      } catch (error) {
        result = error.message
      } finally {
        return result
      }
    }

    const locationHref = tryToReadWidowProp('location.href')
    const topLocationHref = tryToReadWidowProp('top.location.href')

    log('window location:', locationHref)
    log('top location:', topLocationHref)
    log('opener location:', tryToReadWidowProp('opener.location.href'))
    log('opener top location:', tryToReadWidowProp('opener.top.location.href'))

    if (!(locationHref === topLocationHref)) {
      const button = document.createElement('button')
      button.textContent = 'open this frame in a blank target'
      button.addEventListener('click', () => window.open(window.location.href, '_blank'))
      document.body.append(button)
    }

    if (window.opener) {
      const button = document.createElement('button')
      button.textContent = 'navigate top frame of opener to example.com'
      button.addEventListener('click', () => opener.top.location.href = '//example.com')
      document.body.append(button)
    }

  </script>  
</body>
</html>
```
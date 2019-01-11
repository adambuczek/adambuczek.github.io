---
layout: note.njk
title: Iframe Security
date: 2019-01-07
tags: 
 - note
 - iframe
---
You have no control over sites that provide their functionality via embedded frames. 3rd party providers who offer their functionality for free usually gather user data to be sold to ad providers as a form of *payment*.

Cross-origin Frames
---
Modern browsers are non susceptible to cross-origin `iframes` tampering with embedding website. 

This cross-origin frame doesn't have access to `top` frame which is the current website:

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

  It would be really interesting to try this examples on a legacy browser.
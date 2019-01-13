---
layout: note.njk
title: Embedded Iframe GDPR Shield
date: 2019-01-11
tags: 
 - note
 - iframe
published: true 
---
Under General Data Protection Regulation and Privacy and Electronic Communications Regulations you must get user's consent prior to setting cookies on his device.

It wasn't really clear to me how to deal with 3rd party cookies created when embedding iframes.

Online videos, social networking features, analytics and ad targeting... It is safe to assume that such services track a information to measure the number and behavior of users, including information that links user's visits to websites with other accounts that they are logged into. Those cookies may provide data that can be later used by those 3rd parties or other parties they work with for their own purposes, such as targeted ads or analytics. 

I created a snippet that blocks loading of iframes `src` until user gives their express consent.

<iframe
  height='408'
  scrolling='no'
  title='Embedded Iframe GDPR Shield' src='//codepen.io/adambuczek/embed/preview/QrRxgL/?height=403&theme-id=light&default-tab=result'
  frameborder='no'
  allowtransparency='true'
  allowfullscreen='true'
  style='width: 100%;'>
    See the Pen <a href='https://codepen.io/adambuczek/pen/QrRxgL/'>Embedded Iframe GDPR Shield</a> by Adam (<a href='https://codepen.io/adambuczek'>@adambuczek</a>) on <a href='https://codepen.io'>CodePen</a>.
</iframe>

JS code iterates over all `iframe` elements and injects UI elements into them. `data-thumb` can be passed to show as blurred background until `iframe` is loaded.

This method isn't ideal. It is very intrusive but helped me as a part of more robust system used on [return2games.com](https://return2games.com/).
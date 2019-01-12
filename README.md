adambuczek.com
===

Source code for my personal website. Made with [eleventy](https://www.11ty.io/).

Template languages used and their scope
---
This project uses markdown, pug and nunjucks depending on the context. Here are the use cases from most basic.

### Markdown
I use `md` when the focus is on content which should consistently fit the current presentation style and be governed globally. E.g. learning journal entries.

### Pug
When `md` simplicity limits expression I use `pug`. This is middle ground between `md` and `njk`: gives all control needed but doesn't obscure content too much. E. g.: index page.

Note: I added a `md2pug` script to roughly transform markdown to pug. It should be used as a initial step which needs manual review. Use: `npm run md2pug -- -i input.js > output.pug`.

### Nunjucks
For full HTML control with added extensibility used in layouts.

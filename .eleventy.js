const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight')
const inclusiveLangPlugin = require('@11ty/eleventy-plugin-inclusive-language')
const { DateTime } = require('luxon')

const markdownIt = require('markdown-it')
const mdFootnote = require('markdown-it-footnote')

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(syntaxHighlight)
  eleventyConfig.addPlugin(inclusiveLangPlugin)


  // Nunjusks
  eleventyConfig.addNunjucksFilter('formatDate', dateObj => DateTime.fromJSDate(dateObj).toFormat('dd LLL yyyy'))

  // Markdown  
  eleventyConfig.setLibrary("md", markdownIt()
    .use(mdFootnote)
  )

  return {
    dir: {
      input: 'src',
      includes: '_includes',
      output: 'dist'
    },
  }
}

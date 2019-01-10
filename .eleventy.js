const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight')
const inclusiveLangPlugin = require('@11ty/eleventy-plugin-inclusive-language')
const { DateTime } = require('luxon')

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(syntaxHighlight)
  eleventyConfig.addPlugin(inclusiveLangPlugin)

  eleventyConfig.addNunjucksFilter('formatDate', dateObj => DateTime.fromJSDate(dateObj).toFormat('dd LLL yyyy'))

  return {
    dir: {
      input: 'src',
      includes: '_includes',
      output: 'dist'
    },
  }
}

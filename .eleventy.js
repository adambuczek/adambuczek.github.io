const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight')
const inclusiveLangPlugin = require('@11ty/eleventy-plugin-inclusive-language')
const { DateTime } = require('luxon')

const md = require('markdown-it')({
  html: true
})

md.use(require('markdown-it-footnote'))

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(syntaxHighlight)
  eleventyConfig.addPlugin(inclusiveLangPlugin)

  // Nunjucks
  eleventyConfig.addNunjucksFilter('formatDate', function (dateString) {
    if (!dateString) {
      throw new Error(`${this.ctx.slug} has no date set!`)
    }
    return DateTime.fromJSDate(dateString).toFormat('dd LLL yyyy')
  })

  eleventyConfig.addNunjucksFilter('markdown', function (markdownText) {
      if (!markdownText) return
      return md.renderInline(markdownText)
    }
  )

  // Markdown  
  eleventyConfig.setLibrary("md", md)

  return {
    dir: {
      input: 'src',
      includes: '_includes',
      output: 'dist'
    },
  }
}

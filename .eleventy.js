const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight")
const inclusiveLangPlugin = require("@11ty/eleventy-plugin-inclusive-language")

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(syntaxHighlight)
  eleventyConfig.addPlugin(inclusiveLangPlugin)

  return {
    dir: {
      input: "src",
      includes: "_includes",
      output: "dist"
    },
  }
}

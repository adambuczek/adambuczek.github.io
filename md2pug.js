const fs = require('fs')
const md2pug = new (require('markdown-to-pug'))()

class ArgumentError extends Error {}

try {    
    let filename
    let found = false

    for (let i = process.argv.length - 1; i >= 0; i--) {
        if (process.argv[i] === '-i') {
            found = true
            break
        }
        filename = process.argv[i]
    }

    if (!found) throw new ArgumentError('No input file given. Use: node md2pug.js -i input.md > output.pug')
    
    const inputFile = fs.readFileSync(filename, 'utf8')
    
    process.stdout.write(md2pug.render(inputFile))

} catch (error) {
    console.error(error)
}
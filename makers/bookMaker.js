
const MAX = 64 
const MAX_LINES = 18
const TABSPACE = 4
// ~ === /t
async function textMaker (string) {
    var typingLines = [];

    for (var i = 0; i < MAX_LINES; i++) {
        const fragment = string.slice(0, MAX)

        if (fragment.includes('\n')) { //PARAGRAPH BREAK
            const lineBreak = fragment.indexOf('\n')
            const gap = ' '
            typingLines[i] = fragment.slice(0, lineBreak)
            string = '~' + gap.repeat(TABSPACE-1) + string.slice(lineBreak+1, )
        }
        else if (fragment[MAX] === ' ') {
            typingLines[i] = fragment
            string = string.slice(MAX, )
        }
        else {
            let lastSpace = fragment.lastIndexOf(' ') + 1
            typingLines[i] = fragment.slice(0, lastSpace)
            string = string.slice(lastSpace, )
        }
    }
    const lastLine = typingLines.length - 1

    typingLines[lastLine] = typingLines[lastLine].slice(0, typingLines[lastLine].length-1)

    return typingLines
}

const fs = require('fs')
let string = ''

fs.readFile('text.txt', 'utf8', async (err,data) => {
    if (err) {
        console.error(err)
        return
    }
    string = data.toString()
    string = string.replaceAll('\r\n\r\n', '\n').replaceAll('’','\'')
    string = string.replaceAll('\r\n', '')
    string = await textMaker(string)
    console.log(string)
    
    const writeStream = fs.createWriteStream('linesArray.js');

    writeStream.write('export let array = [\n')
    string.forEach(line => writeStream.write(`\t"${line}",\n`));
    writeStream.write('];')

    writeStream.on('finish', () => {
    console.log(`Wrote the text to the file`);
    });
 
    writeStream.on('error', (err) => {
        console.error(`There is an error writing the file => ${err}`)
    });

    writeStream.end();
})

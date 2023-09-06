const fs = require('fs')

//https://randomwordgenerator.com/sentence.php

fs.readFile('./makers/sentences.txt', 'utf8', async (err, data) => {
    if (err) {
        console.error(err)
        return
    }
    let string = data.toString()
    string = string.replaceAll('’','\'')
    string = string.split('\r\n')

    console.log(string)
    
    const writeToFile = function () {
        const writeStream = fs.createWriteStream('./texts/linesMain.js');
        writeStream.write('//num of lines: ' + string.length + '\n')
        writeStream.write('export const array = [\n')
        string.forEach(line => writeStream.write(`"${line}",\n`));
        writeStream.write('];')
    
        writeStream.on('finish', () => {
        console.log(`sentences written to ./texts/linesMain.js`);
        });
     
        writeStream.on('error', (err) => {
            console.error(`There is an error writing the file => ${err}`)
        });
    
        writeStream.end();
    }()
})
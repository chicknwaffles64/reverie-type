let ROWS = 4              //number of rows displayed
const LTRDELAY = 30         //delay of new line transitions, ms
const TABSPACE = 4

const background = document.getElementById('background')
const panel = document.getElementById('panel')
const wrapper = document.getElementsByClassName('wrapper')
const wrapbox = document.getElementsByClassName('wrap-box')
const startscreen = document.getElementById('start-screen')

async function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

let importedText    //the collection containing all the texts to be used
let linesArray = [] //the 

let line = 0;       //line number, will increase throughout
let j = 0;          //index of each char of a line

//variables that keep track of the current line
let currLine = ''   //current line the caret is on
let letters = null  //static NodeList of all letters in the current wrapbox
let onLastLett = false  //whether the caret is on the last letter

let elapsed
let errors = 0

let mode = 'fetch'
let NUMLINES = 4

document.getElementById('start-button').addEventListener('click', async function clickStart() {
    startscreen.style.setProperty('display', 'none')
    background.className = 'background-dim'
    
    if (mode === 'fetch') {
        await fetchText()
    } else {
        await importText()
    }
    await generateTextStart()
})
document.getElementById('mode').addEventListener('click', () => {
    if (mode == 'fetch') {
        mode = 'book'
    }
    else {
        mode = 'fetch'
    }
    document.getElementById('mode').innerHTML = mode
})
document.getElementById('shh').addEventListener('click', () => {
    panel.classList.toggle('duck')
})

async function fetchText() {
    const fetchSentences = async function(numberOfSentences) {
        const response = await fetch("http://metaphorpsum.com/sentences/" + numberOfSentences)
        if (!response.ok) {
            const message = `An error has occured: ${response.status}`;
            throw new Error(message);
        }
        const fetchedText = await response.text()
        return fetchedText
    }
    const textMaker = function (string) {
        const MAX = 64 
        let typingLines = []
        let i = 0
        do {
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
                let lastSpace = fragment.lastIndexOf(' ') + 1;
                typingLines[i] = fragment.slice(0, lastSpace)
                string = string.slice(lastSpace, )
            }
            //EXIT LOOP
            if (typingLines[i] === "") {
                typingLines = typingLines.slice(0, NUMLINES)
                break
            }
        } while(++i < 100)

        //gets rid of space
        const lastLine = typingLines.length - 1
        typingLines[lastLine] = typingLines[lastLine].slice(0, typingLines[lastLine].length-1)
        return typingLines
    }

    const rawtext = await fetchSentences(NUMLINES+2)
    linesArray = textMaker(rawtext)
    return
}
async function importText() {
    switch (mode) {
        case 'book':
            const importedFile = await import('./linesArray.js')
            importedText = importedFile.array
            break

        default:
            console.log('mode is fetchText')
    }
    linesArray = importedText
    console.log('text imported')
    return
}

async function generateTextStart() {
    //GENERATE TEXT
    //console.log(linesArray)
    if (linesArray.length < ROWS) ROWS = linesArray.length

    for (let loop = 0; loop < ROWS; ++loop) {
        const curr_line = linesArray[loop]
        const lineLen = curr_line.length
        
        for (let k = 0; k < lineLen; ++k) {
            const letter = document.createElement("lett")
            wrapbox[loop].appendChild(letter)               
            letter.innerHTML = curr_line[k]
        }
        wrapbox[loop].style.willChange = 'transform';
    }
    await sleep(1000)
    
    //ANIMATE TEXT
    for (let k = 0; k < ROWS; ++k) {
        setTimeout(() => {
            wrapbox[k].classList.remove('init')
        }, 800)

        setTimeout(() => {
            wrapbox[k].style.willChange = 'auto';
            wrapper[k].classList.add('shadow')
            document.addEventListener('keydown', keyHit)
        }, 1500)
    }  
    currLine = linesArray[line]
    letters = wrapbox[0].querySelectorAll('lett')
    letters[0].classList.add("caret")
    errors = 0
    elapsed = new Date();
}
//////////////////////

async function keyHit (keyInput) {
    if (keyInput.key == 'Shift') return

    switch(keyInput.key) {
        case currLine[j]: //CORRECT
            letters[j++].className = "good"
                if (onLastLett == true) await endLineFunction(ROWS)
            letters[j].className = "caret"
            break
        
        case 'Backspace':
            if (j == 0) {return}
            letters[--j+1].className = ""
            letters[j].className = "caret"
            break
            /* OBSOLETE!
            if (j < 0 && line >= 0) j = linesArray[--line].length-1; //GOES BACK A ROW
            */
        default:    //WRONG LETTER
            letters[j++].className = "bad"
                if (onLastLett == true) await endLineFunction(ROWS)
            letters[j].className = "caret"
        errors++
    }
    keyInput.preventDefault()
    if (j+1 == currLine.length) onLastLett = true
}

async function endLineFunction(ROWS) {
    onLastLett = false
    j = 0
    const textLength = linesArray.length
    if (line == textLength - 1) {
        document.removeEventListener('keydown', keyHit)
        elapsed = new Date() - elapsed
        console.log('time: ', elapsed)
        
        await sleep(1000)
        const allLetters = document.getElementsByTagName('lett')
        for (let letter of allLetters) {
            letter.className = ""
        }
        await sleep(1400)
        for (let k = 0; k < ROWS; ++k) {
            wrapbox[k].classList.add('init')
            setTimeout(() => {
                wrapbox[k].replaceChildren()
                wrapper[k].classList.remove('shadow')
            }, 1200)
        }
        await sleep(1500)
        console.log('END OF TEXT')
        line = 0
        resultsScreen()
    }
    else {
    //REMOVE / GENERATE TEXT
    (async function (wrapboxNum = line%ROWS, lineROWS = line+ROWS) {
        //REMOVE
        let leftovers = textLength%ROWS
        if (leftovers == 0) leftovers = ROWS

        if (line >= textLength - leftovers) return //No more lines left to erase
        console.log('still some left to erase')
        
        const currWrapbox = wrapbox[wrapboxNum]
        const letterList = letters
        for (let i of letterList) {
            i.className = "opacity"
            await sleep(LTRDELAY)
        }
        await sleep(1500)
        currWrapbox.replaceChildren()
        if (lineROWS >= textLength) return //No more lines left to generate
        await sleep(1200)
        
        //GENERATE
        if (linesArray[lineROWS].includes('~')) { //LINE BREAK
            const indent = document.createElement("indent")
            const spacing = ' '
            currWrapbox.appendChild(indent)
            indent.innerHTML = spacing.repeat(TABSPACE)
            linesArray[lineROWS] = linesArray[lineROWS].slice(TABSPACE, )
        }
    
        const curr_line = linesArray[lineROWS]
        const lineLenNew = curr_line.length
    
        for (let k = 0; k < lineLenNew; ++k) {
            const letter = document.createElement("lett")
            letter.className = "opacity"
            currWrapbox.appendChild(letter)
            letter.innerHTML = curr_line[k]
        }
        //FADE IN
        const newLetters = currWrapbox.querySelectorAll('lett')
        for (let i of newLetters) {
            await sleep(LTRDELAY)
            i.className = ""
        }
    })();

    currLine = linesArray[++line]
    letters = wrapbox[line%ROWS].querySelectorAll('lett')
    }
}

async function resultsScreen() {
    //CALCULATIONS
    let totalChar = 0
    for (let row of linesArray) {
        totalChar += row.length
    }
    const minutes = elapsed / 1000 / 60
    const seconds = Math.round(elapsed/1000)
    const displayTime = `${Math.floor(minutes)}:${seconds%60}`
    const wpmRate = Math.round(Math.floor((totalChar / minutes)) / 5)
    const accuValue = 100 - Math.round(errors/(totalChar/100))

    //FETCH NEXT LINES IF APPLICABLE
    if (mode === 'fetch') fetchText()

    const endScreen = document.getElementById('end-screen')
    endScreen.className ='opacity'
    endScreen.style.setProperty('display', 'flex')
    setTimeout(() => endScreen.className ='', 40)
    setTimeout(() => {
        for (let blurbox of endScreen.children) {blurbox.classList.add('filter')}
    }, 500)

    const wpm = document.getElementById('wpm')
    const accu = document.getElementById('accu')
    const resTime = document.getElementById('restime')
    resTime.innerHTML = displayTime
    if (wpmRate > accuValue) {
        let delay = Math.floor(1800 / wpm)
        for (let i = 1; i <= accuValue; ++i) {
            await sleep(delay)
            wpm.innerHTML = i
            accu.innerHTML = `${i}%`
        }
         for (let i = accuValue+1; i <= wpmRate; ++i) {
            await sleep(delay)
            wpm.innerHTML = i
        }
    }
    else {
        let delay = Math.floor(1800 / accuValue)
        for (let i = 1; i <= wpmRate; ++i) {
            await sleep(delay)
            accu.innerHTML = `${i}%`
            wpm.innerHTML = i
        }
         for (let i = wpmRate+1; i <= accuValue; ++i) {
            await sleep(delay)
            accu.innerHTML = `${i}%`
        }
    }
    
    endScreen.addEventListener('click', async (e) => {
        await sleep(150)
        switch (e.target.id) {
            case 'change-mode':

                break
            case 'retry':
                endScreen.className ='opacity'
                await sleep(500)
                endScreen.style.setProperty('display', 'none')
                generateTextStart()
            break

            case 'exit':
                endScreen.className ='opacity'
                background.className = ''
                await sleep(1500)
                endScreen.style.setProperty('display', 'none')
                startscreen.style.setProperty('display', 'inline-block')
            break
        }
        
    })

}

////////////////
//EVENT LISTENERS
const lightDarkMode = document.getElementById('dark-light-mode')
lightDarkMode.addEventListener('click', () => {
    const root = document.querySelector(':root');
    if (getComputedStyle(root).getPropertyValue('--theme') == 'rgba(10,10,10)') {
        root.style.setProperty('--theme', 'rgb(248, 230, 230)') //rgb(248, 230, 230) OR #fef6ed
        lightDarkMode.innerHTML = 'LIGHT'
    }
    else { 
        root.style.setProperty('--theme', 'rgba(10,10,10)') 
        lightDarkMode.innerHTML = 'DARK'
    }
})

let backgroundNum = 0;
document.getElementById('switch').addEventListener('click', () => {
    const backgrounds = [
        './garden-of-words-anime.gif',
        './cherry-blossom-anime.gif',
        './walter-white.gif'
    ]
    background.style.backgroundImage = `url(${backgrounds[backgroundNum++]})`
    if (backgroundNum == 3) backgroundNum = 0;
})

function playSound(audioName) {
    let audio = new Audio(audioName);
    audio.play()
}
let ROWS = 4              //number of rows displayed
const LTRDELAY = 30         //delay of new line transitions, ms
const TABSPACE = 4
const MAX = 62 + 1

const background = document.getElementById('background')
const wrapbox = document.getElementsByClassName('wrap-box')
const startscreen = document.getElementById('start-screen')
const endScreen = document.getElementById('end-screen')

async function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

let importedText = []   //the array/file containing all the texts to be used
let linesArray = [] //the current selected text

let line = 0;       //line number, will increase throughout
let j = 0;          //index of each char of a line

//variables that keep track of the current line
let currLine = ''   //current line the caret is on
let letters = null  //static NodeList of all letters in the current wrapbox
let onLastLett = false  //whether the caret is on the last letter

let elapsed //in seconds
let errors = 0
let backspaces = 0

let mode = 'words'
let modeValue = '50'

//instead of global variables, use setattribute

startscreen.addEventListener('click', (e) => {
    if (e.target.id === 'start-button') {
        (async function () {
            startscreen.style.setProperty('display', 'none')
            background.className = 'background-dim'

            await importText(mode)
            await chooseText(mode, modeValue)
            await generateTextStart()
        })()
    }
    switch (e.target.className) {
    case 'mode-button':
        mode = e.target.id
        document.querySelector('.mode-button.select').className = 'mode-button'
        e.target.classList.add('select')

        const limits = document.getElementsByClassName('mode-limit')
        const modetype = document.getElementById('modetype')
        if (mode != 'book' && modetype.textContent.length > 10) {
            modetype.style.cssText = 'background-color: transparent'
            document.getElementById('bookshelf').style.setProperty('display', 'none')
            setTimeout(() => {
                startscreen.style.setProperty('translate', '0 0')
                setTimeout(() => {
                    document.getElementById('start-button').style.setProperty('display', 'inline-block')
                    for (let element of limits) {element.style.cssText = ''}
                }, 800)
            }, 100)
        }

        switch(mode) {
            case 'words':
                modetype.textContent = 'words: '
                limits[0].textContent = '25'
                limits[1].textContent = '50'
                limits[2].textContent = '100'
                limits[3].textContent = '200'
                break
            case 'timed':
                modetype.textContent = 'time: '
                limits[0].textContent = '30s'
                limits[1].textContent = '1 min'
                limits[2].textContent = '2 min'
                limits[3].textContent = '5 min'
                break
            case 'book':
                document.getElementById('start-button').style.setProperty('display', 'none')
                for (let element of limits) {element.style.cssText = 'visibility: hidden;'}
                modetype.textContent = '  Select a text to type. No word or time limits. '
                modetype.style.cssText = 'background-color: black;'
                setTimeout(() => {
                    startscreen.style.setProperty('translate', '0 -200px')
                    setTimeout(() => {document.getElementById('bookshelf').style.setProperty('display', 'flex')}, 500)
                }, 120)
                if (document.getElementById('book-titles').getAttribute('created') === 't') return
                const bookTitles = document.getElementById('book-titles')
                bookTitles.setAttribute('created','t')
                bookShelfEventListener()
                break
        }
        modeValue = parseInt(document.querySelector('.mode-limit.select').textContent)
        break
    case 'mode-limit':
        document.querySelector('.mode-limit.select').className = 'mode-limit'
        e.target.classList.add('select')
        modeValue = parseInt(e.target.textContent)
        break
    }
    console.log(mode, modeValue)
})

function bookShelfEventListener() {

    bookTitles.addEventListener('click', (e) => {
        if (modeValue === e.target.id) return
        modeValue = e.target.id
        let bookInfo = []
        
        switch(e.target.id) {
            case 'harry':
                bookInfo = [
                    ['CH 1 - ', 'The Boy Who Lived'],
                    ['CH 2 - ', 'Vanishing Glass'],
                    ['CH 3 - ', 'The Letters from No One'],
                    ['CH 4 - ', 'The Keeper of Keys'],
                    ['CH 5 - ', 'Diagon Alley'],
                    ['CH 6 - ', 'The Journey from Platform Nine and Three-Quarters'],
                    ['CH 7 - ', 'Diagon Alley'],
                    ['CH 8 - ', 'The Potions Master']
                ]
                break
            case 'teehee':
                bookInfo = [
                    ['CH 1 - ', 'Tdsmans'],
                    ['CH 2 - ', 'Huhuh'],
                ]
                break
        }
        const bookcase = document.getElementById('book-descript')
        if (bookcase.firstChild) {
            const chapters = bookcase.getElementsByTagName('chapter')
            const bookLen = bookInfo.length
            for (let i = bookLen; i < chapters.length; ++i) {chapters[bookLen].remove()}
            for (let i = chapters.length; i < bookLen; ++i) {
                const chapter = document.createElement('chapter')
                const bktitle = document.createElement('bktitle')
                const subtitle = document.createElement('sbtitle')
                chapter.id = i+1
                chapter.append(bktitle, subtitle)
                bookcase.appendChild(chapter)
            }
            for (let i = 0; i < bookInfo.length; ++i) {
                chapters[i].firstChild.textContent = bookInfo[i][0]
                chapters[i].lastChild.textContent = bookInfo[i][1]
            }
        }
        else {
            for (let i = 0; i < bookInfo.length; ++i) {
                const chapter = document.createElement('chapter')
                const bktitle = document.createElement('bktitle')
                const subtitle = document.createElement('sbtitle')
                bktitle.textContent = bookInfo[i][0]
                subtitle.textContent = bookInfo[i][1]
                chapter.id = i+1
                chapter.append(bktitle, subtitle)
                bookcase.appendChild(chapter)
            }
        }
    })
    document.getElementById('book-descript').addEventListener('click', (e) => {
        if(!parseInt(e.target.id)) return

        const activePopup = document.getElementById('popupActive')
        if (activePopup != null) {
            activePopup.className = ''
            activePopup.id = 'unactive'
            setTimeout(() => {
                document.getElementById('unactive').remove()
            },300)
            document.getElementById('start-book').id = 'unactivebutt'
            if (e.target.nextSibling) {
                if (e.target.nextSibling.tagName == 'POPUP') return
            }
        }

        const popup = document.createElement('popup')
        const startButt = document.createElement('button')
        popup.id = 'popupActive'
        startButt.id = 'start-book'
        startButt.textContent = 'START'
        startButt.addEventListener('click', async ()=>{
            const bookshelf = document.getElementById('bookshelf')
            bookshelf.className='transparent'
            await sleep(1000)
            bookshelf.style.setProperty('display', 'none')
            bookshelf.className=''
            startscreen.style.setProperty('display', 'none')
            background.className = 'background-dim'
            document.getElementById('popupActive').remove()

            await importText(mode, e.target.id)
            await chooseText(mode, modeValue)
            await generateTextStart()
        })
        popup.appendChild(startButt)
        e.target.insertAdjacentElement('afterend', popup)
        setTimeout(()=>{popup.className = 'popup'},50)
    })
}

async function importText(mode, chapter) {
    if (mode !== 'book') {
        if (startscreen.getAttribute('currentmode').includes(mode)) return
    }

    let importDirectory = './texts/linesMain.js'
    switch (mode) {
        case 'book':
            importDirectory = `./texts/${modeValue}/${modeValue+chapter}.js`
            startscreen.setAttribute('currentmode', 'book')
            break
        default:
            startscreen.setAttribute('currentmode', 'words timed')
    }
    const importedFile = await import(importDirectory)
    importedText = importedFile.array
    console.log('text imported')
    return
}

async function chooseText(mode, wrdlimit) { //limit = wordlimit or timelimit
    linesArray = []
    switch (mode) {
        case 'book':
            linesArray = importedText
            break
        default:
            if (mode === 'timed') wrdlimit = 200

            const lines = importedText.length - 1
            let words = 0
            let combine = []
            let duplicates = []

            while (words <= wrdlimit) {
                const rand = Math.round(Math.random()*lines)
                if (duplicates.includes(rand)) continue

                const newline = importedText[rand]
                combine.push(newline)
                duplicates.push(rand)
                words += (newline.match(/ /g).length + 1)
            }

            let lastLine = combine[combine.length-1]
            const lastLineWords = lastLine.match(/ /g).length + 1
            combine[combine.length-1] = lastLine.split(' ', lastLineWords-(words-wrdlimit)).join(' ')
            combine = combine.join(' ')

            while(true) {
                if (combine.length < MAX) {
                    linesArray.push(combine)
                    break
                }
                else if (combine[MAX] == ' ') {
                    linesArray.push(combine.slice(0, MAX+1))
                    combine = combine.slice(MAX+1, )
                }
                else {
                    const fragment = combine.slice(0, MAX)
                    const lastSpace = fragment.lastIndexOf(' ') + 1
                    linesArray.push(fragment.slice(0, lastSpace))
                    combine = combine.slice(lastSpace, )
                }
            }
    }
    console.log(linesArray)
    return
}

async function generateTextStart() {
    //GENERATE TEXT
    ROWS = 4
    if (linesArray.length < 4) ROWS = linesArray.length

    for (let loop = 0; loop < ROWS; ++loop) {
        const curr_line = linesArray[loop]
        const lineLen = curr_line.length
        
        for (let k = 0; k < lineLen; ++k) {
            const letter = document.createElement("lett")
            wrapbox[loop].appendChild(letter)               
            letter.textContent = curr_line[k]
        }
        wrapbox[loop].style.willChange = 'transform';
    }
    await sleep(1000)
    const wrapper = document.getElementsByClassName('wrapper')
    //ANIMATE TEXT
    for (let k = 0; k < ROWS; ++k) {
        setTimeout(() => {
            wrapbox[k].classList.remove('init')
            setTimeout(() => {
                wrapbox[k].style.willChange = 'auto';
                wrapbox[k].classList.add('filter')
                wrapper[k].classList.add('shadow')
            }, 800)
        }, 800)
    }  
    letters = wrapbox[0].getElementsByTagName('lett')
    letters[0].classList.add("caret")
    line = 0
    j = 0
    onLastLett = false
    currLine = linesArray[line]
    errors = 0
    backspaces = 0
    
    await sleep(1200)
    if (mode === 'timed') timedMode(modeValue)
    document.addEventListener('keydown', keyHit)
    elapsed = new Date();
    return
}
//////////////////////

async function timedMode(modeValue) {
    const minutedigit = document.getElementById('minutes')
    const seconddigit = document.getElementById('seconds')
    let timer = modeValue + 1
    if (modeValue < 10) timer = modeValue*60 + 1
    let seconds = timer % 60
    minutedigit.textContent = Math.floor(timer/60)
    seconddigit.textContent = ('0'+seconds).slice(-2)
    
    const clock = document.getElementById('clock')
    clock.style.cssText = 'display: flex;'
    await sleep(50)
    clock.classList.remove('transparent')

    while(--timer >= 0) {
        if (seconds === 0) {
            seconds = 60
            minutedigit.textContent = Math.floor(timer/60)
        }
        seconddigit.textContent = (`0${--seconds}`).slice(-2)
        await sleep(1000)
        if (letters === null) {
            clock.classList.add('transparent')
            await sleep(1500)
            clock.style.cssText = 'display: none;'
            return
        }
    }
    document.removeEventListener('keydown', keyHit)
    clock.classList.add('transparent')
    elapsed = modeValue
    if (modeValue < 10) elapsed = modeValue*60
    await sleep(2000)
    await clearScreen()
    clock.style.cssText = 'display: none;'
    resultsScreen()
}

function keyHit (keyInput) {
    if (keyInput.key == 'Shift' || keyInput.key == 'CapsLock') return

    switch(keyInput.key) {
        case currLine[j]: //CORRECT
            letters[j++].className = "good"
            if (onLastLett == true) {endLineFunction(ROWS); break}
            letters[j].className = "caret"
            break
        
        case 'Backspace':
            if (j == 0) {return}
            letters[--j+1].className = ""
            letters[j].className = "caret"
            backspaces++
            break

        default:    //WRONG LETTER
            letters[j++].className = "bad"
            if (onLastLett == true) {endLineFunction(ROWS); break}
            letters[j].className = "caret"
            errors++
    }
    keyInput.preventDefault()
    if (j+1 == currLine.length) onLastLett = true
}

async function endLineFunction(ROWS) {
    onLastLett = false
    j = 0

    if (line == linesArray.length - 1) {
        document.removeEventListener('keydown', keyHit)
        elapsed = (new Date() - elapsed)/1000
        await sleep(1000)
        await clearScreen()
        resultsScreen()
        return
    }
    else {
    //REMOVE / GENERATE TEXT
    removeGenerate(line%ROWS, line+ROWS, letters)
    }
    currLine = linesArray[++line]
    letters = wrapbox[line%ROWS].getElementsByTagName('lett')
    letters[j].className = "caret"
}

async function removeGenerate(wrapboxNum, lineROWS, letterList) {
    //REMOVE
    const textLength = linesArray.length
    let leftovers = textLength%ROWS
    if (leftovers == 0) leftovers = ROWS
    if (line >= textLength - leftovers) return //No more lines left to erase
    
    const currWrapbox = wrapbox[wrapboxNum]
    for (let i of letterList) {
        i.className = "transparent"
        await sleep(LTRDELAY)
    }
    await sleep(1000)
    currWrapbox.replaceChildren()
    if (lineROWS >= textLength) return //No more lines left to generate
    
    //GENERATE
    await sleep(2000)
    if (linesArray[lineROWS].includes('~')) { //LINE BREAK
        const indent = document.createElement("indent")
        const spacing = ' '
        currWrapbox.appendChild(indent)
        indent.textContent = spacing.repeat(TABSPACE)
        linesArray[lineROWS] = linesArray[lineROWS].slice(TABSPACE, )
    }

    const curr_line = linesArray[lineROWS]
    const lineLenNew = curr_line.length

    for (let k = 0; k < lineLenNew; ++k) {
        const letter = document.createElement("lett")
        letter.className = "transparent"
        currWrapbox.appendChild(letter)
        letter.textContent = curr_line[k]
    }
    //FADE IN
    const newLetters = currWrapbox.querySelectorAll('lett')
    for (let i of newLetters) {
        await sleep(LTRDELAY)
        i.className = ""
    }
}

async function resultsScreen() {
    //CALCULATIONS
    let totalChar = backspaces
    if (mode === 'timed') {
        totalChar += j
        for (let i = 0; i < line; ++i) {
            totalChar += linesArray[i].length
        }
    }
    else {
        for (let row of linesArray) {
            totalChar += row.length
        }
    }
    const wpmRate = Math.round((totalChar/(elapsed/60))/5)
    const accuValue = 100 - Math.round(errors/(totalChar/100))

    endScreen.className ='transparent'
    endScreen.style.setProperty('display', 'flex')
    setTimeout(() => endScreen.className ='', 40)
    setTimeout(() => {
        for (let blurbox of endScreen.children) {blurbox.classList.add('filter')}
    }, 500)

    const wpm = document.getElementById('wpm')
    const accu = document.getElementById('accu')
    const resTime = document.getElementById('restime')
    resTime.textContent = `${Math.floor(elapsed/60)}:${('0'+Math.round(elapsed%60)).slice(-2)}`

    if (wpmRate > accuValue) {
        let delay = Math.floor(1800 / wpm)
        for (let i = 1; i <= accuValue; ++i) {
            await sleep(delay)
            wpm.textContent = i
            accu.textContent = `${i}%`
        }
         for (let i = accuValue+1; i <= wpmRate; ++i) {
            await sleep(delay)
            wpm.textContent = i
        }
    }
    else {
        let delay = Math.floor(1800 / accuValue)
        for (let i = 1; i <= wpmRate; ++i) {
            await sleep(delay)
            accu.textContent = `${i}%`
            wpm.textContent = i
        }
         for (let i = wpmRate+1; i <= accuValue; ++i) {
            await sleep(delay)
            accu.textContent = `${i}%`
        }
    }
    if(endScreen.getAttribute('listener')) return
    endScreen.addEventListener('click', endScreenListener)
    endScreen.setAttribute('listener', 'true')
}
async function endScreenListener(e) {
    await sleep(150)
    switch (e.target.id) {
        case 'retry':
            endScreen.className ='transparent'
            await sleep(500)
            endScreen.style.setProperty('display', 'none')
            await chooseText(mode, modeValue)
            await generateTextStart()
            break

        case 'exit':
            endScreen.removeEventListener('click', endScreenListener)
            endScreen.className ='transparent'
            background.className = ''
            await sleep(1500)
            endScreen.style.setProperty('display', 'none')
            startscreen.style.setProperty('display', 'flex')
            if (mode === 'book') document.getElementById('bookshelf').style.setProperty('display', 'flex')
            break
    }
}

////////////////
//EVENT LISTENERS
const lightDarkMode = document.getElementById('dark-light-mode')
lightDarkMode.addEventListener('click', () => {
    const root = document.querySelector(':root');
    if (getComputedStyle(root).getPropertyValue('--theme') == 'rgba(14,14,14)') {
        root.style.setProperty('--theme', 'rgb(248, 230, 230)') //rgb(248, 230, 230) OR #fef6ed
        lightDarkMode.textContent = 'LIGHT'
    }
    else { 
        root.style.setProperty('--theme', 'rgba(14,14,14)') 
        lightDarkMode.textContent = 'DARK'
    }
})

let backgroundNum = 1;
document.getElementById('switch').addEventListener('click', () => {
    const backgrounds = [
        './garden-of-words-anime.gif',
        './cherry-blossom-anime.gif',
        './walter-white.gif'
    ]
    background.style.backgroundImage = `url(${backgrounds[backgroundNum++]})`
    if (backgroundNum == 3) backgroundNum = 0;
})

document.getElementById('menu').addEventListener('click', async () => {
    document.removeEventListener('keydown', keyHit)
    await sleep(200)
    await clearScreen()
    await sleep(1400)
    startscreen.style.setProperty('display', 'flex')
    if (mode === 'book') document.getElementById('bookshelf').style.setProperty('display', 'flex')
})

async function clearScreen() {
    letters = null
    const allLetters = document.getElementsByTagName('lett')
    for (let letter of allLetters) {letter.className = ""}
    await sleep(1400)
    const wrapper = document.getElementsByClassName('wrapper')
    for (let k = 0; k < ROWS; ++k) {
        wrapbox[k].classList.add('init')
        setTimeout(() => {
            wrapbox[k].replaceChildren()
            wrapbox[k].classList.add('filter')
            wrapper[k].classList.remove('shadow')
        }, 1200)
    }
    await sleep(500)
}
function playSound(audioName) {
    let audio = new Audio(audioName);
    audio.play()
}
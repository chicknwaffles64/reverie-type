const ROWS = 4              //number of rows displayed
const LTRDELAY = 40         //delay of new line transitions, ms


const keyboardInput = document.getElementById('keyboard-input')
const panel = document.getElementById('panel')
const wrapper = document.getElementsByClassName('wrapper')
const wrapbox = document.getElementsByClassName('wrap-box')

async function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

let isListening = false
let i = 1                   //letter id, the program's universal counter (will keep on increasing)
let ltrsOnScreen = 1000     //the number of letters generated at the start, is used in the functions inside clickStart()
let totalLines = 0

const linesArray = [
    'Mr. and Mrs. Dursley, of number four, Privet Drive, were proud ',
    'to say that they were perfectly normal, thank you very much. ',
    "They were the last people you'd expect to be involved in ",
    "anything strange or mysterious, because they just didn't hold ",
    'with such nonsense. Mr. Dursley was the director of a firm ',
    'called Grunnings, which made drills. He was a big, beefy man ',
    'with hardly any neck, although he did have a very large ',
    'mustache. Mrs. Dursley was thin and blonde and had nearly twice ',
    'the usual amount of neck, which came in very useful as she ',
    'spent so much of her time craning over garden fences, spying on ',
    'the neighbors. The Dursley s had a small son called Dudley and ',
    'in their opinion there was no finer boy anywhere. The Dursleys ',
    'had everything they wanted, but they also had a secret, and '
  ]

async function clickStart() {
    document.getElementById('start-button')
        .style.cssText = 'display: none'
    document.getElementById('background').classList.toggle('background-dim')
    
    totalLines = linesArray.length
    console.log(linesArray)

    await makeRows()
    await generateTextStart()             //delay in ms
    await startAnimations()  //delay until function execution, delay applying classes, delay removing classes
}

async function makeRows() {
    switch (ROWS) {
        case 3:
            wrapper[3].remove()
            break
        case 5:
            const newWrapper = document.createElement("div")              
            panel.appendChild(newWrapper)
            newWrapper.classList.add("wrapper")

            const newWrapBox = document.createElement("div")              
            newWrapper.appendChild(newWrapBox)
            newWrapBox.classList.add("wrap-box", "init")
            break
    }
    await sleep(500)
}

async function generateTextStart() {
    
    for (let loop = 0; loop < ROWS; ++loop) {
        const curr_line = linesArray[loop]
        const lineLen = curr_line.length
        
        for (let k = 0; k < lineLen; ++k) {           //counter will reset with each line, while i does not
            const newSpan = document.createElement("span")                         
                newSpan.innerHTML = curr_line.charAt(k);
                newSpan.setAttribute('id', i)
                newSpan.classList.add("typespan")

            wrapbox[loop].appendChild(newSpan)
            ++i
        }
        wrapbox[loop].style.willChange = 'transform, backdrop-filter';
    }
    ltrsOnScreen = i;       //becomes the 'id' of last letter currently on screen
}

async function startAnimations() {
    await sleep(1000)
    
    for (let k = 0; k < ROWS; ++k) {
        wrapbox[k].classList.add('filter')

        setTimeout(function() {
            wrapbox[k].classList.remove('init')
        }, 800)

        setTimeout(function() {
            wrapbox[k].style.willChange = 'auto';
            wrapper[k].classList.add('shadow')
            isListening = true
        }, 1500)
    }
    document.getElementById(`1`).classList.add("caret")
    currLine = linesArray[line]
    currLength = currLine.length - 1
}

//////////////////////

let line = 0;       //line number, will increase thru-out
let j = 0;          //for ids, universial counter
let index = 0;      //index #1 is the 1st char of each line
let idOf1st = 1;  //the id of the 1st char of each line
let currLine = ''
let currLength = null;

keyboardInput.addEventListener('keydown', keyInput => {
    if (keyInput.key == 'Shift' || keyInput.key == 'CapsLock') {return}

    if (isListening == false) {
        if (j == 0) { return }

        if (keyInput.key == currLine[index]) {
            document.getElementById(j).classList.replace("caret","bad")
        }
        else {
            document.getElementById(j).classList.replace("caret","bad")
        }
        //END OF PROGRAM HERE
        return
    }

    switch(keyInput.key) {
        case currLine[index]: //CORRECT
            document.getElementById(++j).classList.replace("caret","good")
            document.getElementById(j+1).classList.add("caret")
            index++;
            break
        
        case 'Backspace':
            if (index == 0) {return}

            document.getElementById(--j+2).classList.remove("caret")
            document.getElementById(j+1).classList.remove("good","bad")
            document.getElementById(j+1).classList.add("caret")
            index--;
            
            /* OBSOLETE!
            if (index < 0 && line >= 0) {   
                index = linesArray[--line].length-1; //minus 1 to account for the first letter being at index #1
                }
                */
            break

        default:    //WRONG LETTER
            document.getElementById(++j).classList.replace("caret","bad")
            document.getElementById(j+1).classList.add("caret")
            index++;
    }

    if (index >= currLength) {
        
        if (index == currLength + 1) { //user is on the very last letter
            const wrapboxNum = line%ROWS
            if (line+ROWS > totalLines-1) {
                removeLine(idOf1st, j, wrapboxNum)
                }
            else {
                generateLine(idOf1st, j, wrapboxNum, line+ROWS) //wrapbox num | num of newline
                }
            currLine = linesArray[++line]
            currLength = currLine.length - 1
            index = 0;
            }
        else if (line == totalLines-1) { //END OF TEXT
                isListening = false
                removeLine(idOf1st, j+1, line%ROWS)         
            }
        }
     //won't allow that input to pass
     keyInput.preventDefault()
})

async function removeLine(start, end, boxNum) {
    //FADE OUT
    idOf1st = end + 1
    for (let k = start; k <= end; ++k) {
        document.getElementById(k).classList.toggle('opacity')  ////CSS CLASS
        await sleep(LTRDELAY)
    }
    //DELETE
    await sleep(2500) //is dependent on CSS opacity duration
    wrapbox[boxNum].replaceChildren()
}

async function generateLine(idOf1st, j, wrapboxNum, lineROWS) {
    //REMOVE
    await removeLine(idOf1st, j, (lineROWS-ROWS)%ROWS)
    //GENERATE
    const lineLenNew = linesArray[lineROWS].length
    let currentId = i
    let newStart = currentId - 1
    i += lineLenNew
    
    for (let k = 0; k < lineLenNew; ++k) {
        const newSpan = document.createElement("span")
            newSpan.setAttribute('id', currentId)
            newSpan.innerHTML = linesArray[lineROWS].charAt(k);
            newSpan.classList.add("typespan", "opacity")  ////CSS CLASS

        wrapbox[wrapboxNum].appendChild(newSpan)
        ++currentId
    }
    
    //FADE IN
    for (let k = newStart; k < currentId; ++k) {
        document.getElementById(k).classList.toggle('opacity')      ////CSS CLASS
        await sleep(LTRDELAY)                             
    }
}

/////////////////
window.addEventListener('click', () => {
    document.getElementById('keyboard-input').focus();
})

function playSound(audioName) {
    let audio = new Audio(audioName);
    audio.play()
}

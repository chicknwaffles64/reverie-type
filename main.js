const keyboardInput = document.querySelector('.keyboard-input')

keyboardInput.addEventListener('keypress', keyInput => {
    console.log(keyInput)
    if (keyInput.key === 's') {
    }
    const text = document.getElementById("typingText")
    text.innerHTML += keyInput.key
    keyInput.preventDefault() //won't allow that input to pass
})

window.addEventListener('click', () => {
    document.querySelector('.keyboard-input').focus();
})
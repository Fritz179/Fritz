const listeners = {allNameSpaces: []}

p5.prototype.listenInput = (listener, nameSpace) => {
  if (nameSpace) {
    listeners[nameSpace] = []
    listeners[nameSpace].push(listener)
  } else {
    listeners.allNameSpaces.push(listener)
  }
}

p5.prototype.removeAlllisteners = nameSpaceToRemove => {
  if (nameSpaceToRemove) {
    listeners[nameSpaceToRemove] = []
  } else {
    for (let nameSpace in listeners) {
      nameSpace = []
    }
  }
}

window.keyPressed = () => {
  if (key == '$') {
    debugEnabled = !debugEnabled
  }
  const input = names[key] || key
  if (listeners[status]) {
    listeners[status].forEach(listener => {
      if (typeof listener.onInput == 'function') listener.onInput(input)
    })
  }
  listeners.allNameSpaces.forEach(listener => {
    if (typeof listener.onInput == 'function') listener.onInput(input)
  })
}

window.mousePressed = () => {
  if (listeners[status]) {
    listeners[status].forEach(listener => {
      if (typeof listener.mousePressed == 'function') listener.mousePressed()
    })
  }
  listeners.allNameSpaces.forEach(listener => {
    if (typeof listener.mousePressed == 'function') listener.mousePressed()
  })
}

function removeListener(listener) {
  for (let nameSpace in listeners) {
    for (let i = nameSpace.length - 1; i >= 0; i--) {
      if (listener._id == nameSpace[i]._id) nameSpace.splice(i, 1)
    }
  }
}

const names = {
  w: 'up',
  ArrowUp: 'up',
  d: 'right',
  ArrowRight: 'right',
  s: 'down',
  ArrowDown: 'down',
  a: 'left',
  ArrowLeft: 'left',
}

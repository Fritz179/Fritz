const listeners = {allNamespaces: []}

p5.prototype.listenInput = (listener, key) => {
  if (key) {
    listeners[key] = []
    listeners[key].push(listener)
  } else {
    listeners.allNamespaces.push(listener)
  }
}

p5.prototype.removeAlllisteners = keyToRemove => {
  if (keyToRemove) {
    listeners[keyToRemove] = []
  } else {
    for (let key in listeners) {
      key = []
    }
  }
}

window.keyPressed = () => {
  if (key == '$') {
    debugEnabled = !debugEnabled
  }
  const input = names[key] || key
  if (listeners[currentStatus]) {
    listeners[currentStatus].forEach(listener => {
      if (typeof listener._onInput == 'function') listener._onInput(input)
      else if (typeof listener.onInput == 'function') listener.onInput(input)
    })
  }
  listeners.allNamespaces.forEach(listener => {
    if (typeof listener.onInput == 'function') listener.onInput(input)
    else if (typeof listener._onInput == 'function') listener._onInput(input)
  })
}

window.mousePressed = () => {
  if (listeners[currentStatus]) {
    listeners[currentStatus].forEach(listener => {
      if (typeof listener._onclick == 'function') listener._onclick()
      else if (typeof listener.onclick == 'function') listener.onclick()
    })
  }
  listeners.allNamespaces.forEach(listener => {
    if (typeof listener._onclick == 'function') listener._onclick()
    else if (typeof listener.onclick == 'function') listener.onclick()
  })
}

function removeListener(listener) {
  for (let key in listeners) {
    for (let i = key.length - 1; i >= 0; i--) {
      if (listener._id == key[i]._id) key.splice(i, 1)
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

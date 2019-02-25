const listeners = []

p5.prototype.listenInput = (listener) => {
  listeners.push(listener)
}

window.keyPressed = () => {
  if (key == '$') {
    debugEnabled = !debugEnabled
  }
  listeners.forEach(listener => {
    listener.onInput(names[key] || key)
  })
}

function removeListener(listener) {
  for (let i = listeners.length - 1; i >= 0; i--) {
    if (listener._id == listeners[i]._id) listeners.splice(i, 1)
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

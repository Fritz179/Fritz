const listeners = {allNamespaces: []}

p5.prototype.listenInputs = (listener, key) => {
  if (key) {
    if (!listeners[key]) listeners[key] = []
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
      listeners[key] = []
    }
  }
}

window.keyPressed = () => {
  if (key == '$') {
    debugEnabled = !debugEnabled
  }
  const input = typeof names[key] != 'undefined' ? names[key].toString() : key.toString()
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
  Insert: 0,
}

// //keep trak of all entities to listen for
// const listeners = {
//   onMouse: new Set(),
//   onMouseReleased: new Set(),
//   onMouseDragged: new Set(),
//   onKey: new Set(),
//   onKeyReleased: new Set(),
//   onClick: new Set(),
//   onClickDragged: new Set(),
//   onClickReleased: new Set()
// }
//
// p5.prototype.addListener = (to, entity) => {
//   //check if event exists and has an EventHandler funtion
//   if (!listeners[to]) throw new Error(`Cannot listen to: ${to}, valid events: ${Object.keys(listeners)}`)
//   if (typeof entity[to] != 'funtion') throw new Error(`Entity doesn't have a ${to}() funtion`)
//
//   //add entity
//   listeners[to].add(entity)
// }
//
// p5.prototype.removeListener = (of, entity) => {
//   //check if event exists
//   if (!listeners[of]) throw new Error(`Cannot remove listener of: ${of}, valid events: ${Object.keys(listeners)}`)
//
//   //add entity
//   listeners[of].remove(entity)
// }
//
// p5.protype.removeListener
//
// p.prototype.removeAllListeners = entity => {
//   //loop trough all listeners and remove the entity
//   for (let key in listeners) {
//     listeners[key].remove(entity)
//   }
// }
//
//
//                             ///////////////////////
//                            //// HANDLE EVENTS ////
//                           ///////////////////////
//
//
// window.mousePressed = () => {
//   //normal event
//   listeners.onMouse.forEach(entity => entity.onMouse())
//
//   //if the mouse is over the entity, call custom function
//   listeners.onClick.forEach(entity => {
//     if (p5.protoype.realMouseIsOver(entity)) {
//       entity.onClick()
//       entity._wasOnClick = true
//     }
//   })
// }
//
// window.mouseDragged = () => {
//   //normal event
//   listeners.onMouseDragged.forEach(entity => entity.onMouseDragged())
//
//   //if the mouse was over the entity, call it's custom function
//   listeners.onClickDragged.forEach(entity => {
//     if (entity._wasOnClick) entity.onClickDragged()
//   })
// }
//
// window.mouseReleased = () => {
//   //normal event
//   listeners.onMouseReleased.forEach(entity => entity.onMouseReleased())
//
//   //if the mouse was over the entity, call it's custom function
//   listeners.onClickReleased.forEach(entity => {
//     if (entity._wasOnClick) {
//       entity.onMouseReleased()
//       entity._wasOnClick = false
//     }
//   })
// }
//
// window.keyPressed = () => {
//   listeners.onKey.forEach(entity => entity.onKey(key))
// }
//
// window.keyReleased = () => {
//   listeners.onKeyReleased.forEach(entity => entity.onKeyReleased(key))
// }

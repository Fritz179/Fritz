// TODO: add names...
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

//keep trak of all entities to listen for
const listeners = {
  onMouse: new Set(),
  onMouseReleased: new Set(),
  onMouseDragged: new Set(),
  onKey: new Set(),
  onKeyReleased: new Set(),
  onClick: new Set(),
  onClickDragged: new Set(),
  onClickReleased: new Set()
}

p5.prototype.addListener = (listener, ...toArr) => {
  toArr.forEach(to => {
    //if its a keyWord, expand it
    if (to == 'all') return p5.prototype.addListener(listener, 'mouse', 'key', 'click')
    if (to == 'mouse') return p5.prototype.addListener(listener, 'onMouse', 'onMouseDragged', 'onMouseReleased')
    if (to == 'key') return p5.prototype.addListener(listener, 'onKey', 'onKeyReleased')
    if (to == 'click') return p5.prototype.addListener(listener, 'onClick', 'onClickDragged', 'onClickReleased')

    //check if event exists and has an EventHandler function
    if (!listeners[to]) throw new Error(`Cannot listen to: ${to}, valid events: ${Object.keys(listeners)}`)
    if (typeof listener[to] != 'function' && typeof listener[`_${to}`] != 'function') throw new Error(`Listener doesn't have a ${to}() function`)

    //add listener
    listeners[to].add(listener)
  })
}

p5.prototype.removeListenerOf = (listener, ...toUnlisten) => {
  toUnlisten.forEach(of => {
    //check if event exists
    if (!listeners[of]) throw new Error(`Cannot remove listener of: ${of}, valid events: ${Object.keys(listeners)}`)

    //add entity
    listeners[of].delete(listener)
  })
}

p5.prototype.removeListener = listener => {
  //loop trough all listeners clear it
  for (let key in listeners) {
    listeners[key].delete(listener)
  }
}

p5.prototype.removeAllListeners = () => {
  //loop trough all listeners clear it
  for (let key in listeners) {
    listeners[key].clear()
  }
}


                            ///////////////////////
                           //// HANDLE EVENTS ////
                          ///////////////////////


window.mousePressed = () => {
  //normal event
  listeners.onMouse.forEach(entity => entity.onMouse())

  //if the mouse is over the entity, call custom function
  listeners.onClick.forEach(entity => {
    if (p5.protoype.realMouseIsOver(entity)) {
      entity.onClick()
      entity._wasOnClick = true
    }
  })
}

window.mouseDragged = () => {
  //normal event
  listeners.onMouseDragged.forEach(entity => entity.onMouseDragged())

  //if the mouse was over the entity, call it's custom function
  listeners.onClickDragged.forEach(entity => {
    if (entity._wasOnClick) entity.onClickDragged()
  })
}

window.mouseReleased = () => {
  //normal event
  listeners.onMouseReleased.forEach(entity => entity.onMouseReleased())

  //if the mouse was over the entity, call it's custom function
  listeners.onClickReleased.forEach(entity => {
    if (entity._wasOnClick) {
      entity.onMouseReleased()
      entity._wasOnClick = false
    }
  })
}

window.keyPressed = () => {
  if (key == '$') debugEnabled = !debugEnabled
  
  listeners.onKey.forEach(entity => entity.onKey(names[key] || key))
}

window.keyReleased = () => {
  listeners.onKeyReleased.forEach(entity => entity.onKeyReleased(names[key] || key))
}

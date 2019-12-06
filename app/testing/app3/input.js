let debugEnabled = 0
let allowRepeatedKeyPressed = false
let mouseIsClicked = 0
const mouseDirs = ['Left', 'Middle', 'Right', '']

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

const downKeys = {}
function isDown(key) { // global
  return downKeys[key]
}

//save a reference for each crawling function
const crawlers = {}
function createCrawler(eventName, allowed = () => true, bubble = false) { // global
  //move crawling parameters in this scope

  // flag for stopPropagation and preventDefault
  let bubbleCancelled = false
  let preventDefault = false
  let toBubble = []

  let stoppers = {
    stopPropagation: () => bubbleCancelled = true,
    preventDefault: () => preventDefault = true
  }

  function crawl(target, args, parent) {

    // allowed function to also call an alternative enventName
    let altName = false

    if (allowed(target, args, parent, alt => altName = alt)) {
      target[eventName](args)
      if (altName) {
        target[altName](args)
      }
    }

    if (typeof target.forEachChild == 'function') {
      target.forEachChild(child => {
        crawl(child, Object.assign({}, args, stoppers), target)
      })
    }

    if (bubble) {
      toBubble.push({target, altName, args})
    }
  }

  // save global reference
  crawlers[eventName] = (target, args) => {
    if (preloadCounter == 0) {

      // reset falgs
      bubbleCancelled = false
      preventDefault = false
      crawl(target, args, target) // parent == target

      if (bubble && !bubbleCancelled) {
        toBubble.forEach(({target, altName, args}) => {
          target[`${eventName}Bubble`](Object.assign({}, args))
          if (altName) {
            target[`${altName}Bubble`](Object.assign({}, args))
          }
        })
      }
      toBubble.splice(0)

      return {preventDefault, bubbleCancelled}
    }
  }
}

//global function ta start a crawler
function crawl(...args) { // global
  const target = typeof args[0] == 'string' ? masterLayer : args.splice(0, 1)
  const eventName = args.splice(0, 1)

  if (!crawlers[eventName]) throw new Error(`Cannot crawl ${eventName}, us createCrawler() to define a crawler`)
  return crawlers[eventName](target, args[0])
}

function mapMouse(drag, allow, alt) {
  return (target, args, parent, setAlt) => {
    if (target instanceof Layer) {
      const {xAlign, yAlign, overflow} = target.cameraMode

      args.x = round((args.x - parent.w * xAlign) / target.xm + (target.x + target.w * xAlign))
      args.y = round((args.y - parent.h * yAlign) / target.ym + (target.y + target.h * yAlign))
    } else {
      args.x = round(args.x / target.xm - target.x)
      args.y = round(args.y / target.ym - target.y)
    }

    if (drag) {
      args.xd = args.xd / target.xm
      args.yd = args.yd / target.ym
    }

    if (allow && allow(target, args, parent)) {
      setAlt(alt)
    }

    return true
  }
}

//onMouse and onClick crawlers
mouseDirs.forEach(dir => {
  const mapper = mapMouse(false, (t, a, p) => pointIsInRange(a, t.w, t.h) ? t._wasOnClick = true : false, `on${dir}Click`)
  createCrawler(`on${dir}Mouse`, mapper, true)
})
window.addEventListener('mousedown', event => {
  const {x, y, button} = event

  mouseIsClicked = button + 1
  let {bubbleCancelled} = crawl(`on${mouseDirs[button]}Mouse`, {x, y})
  
  if (!bubbleCancelled) {
    crawl('onMouse', {x, y, button})
  }

  event.preventDefault()
});

//onMouseDrag and onClickDrag crawlers
createCrawler('onDrag', mapMouse(true))
mouseDirs.forEach(dir => {
  const mapper = mapMouse(true, (t, a, p) => t._wasOnClick, `on${dir}ClickDrag`)
  createCrawler(`on${dir}MouseDrag`, mapper, true)
})

window.addEventListener('mousemove', ({movementX, movementY, x, y}) => {
  const args = {x, y, xd: movementX, yd: movementY, button: mouseIsClicked - 1}
  crawl('onDrag', Object.assign({}, args))
  if (mouseIsClicked) {
    crawl('onMouseDrag', Object.assign({}, args))
    crawl(`on${mouseDirs[mouseIsClicked - 1]}MouseDrag`, Object.assign({}, args))
  }
});

//onMouseUp and onClickUp crawlers
mouseDirs.forEach(dir => {
  // const mapper = mapMouse(false, (t, a, p) => t._wasOnClick ? !(t._wasOnClick = false) : false, `on${dir}ClickUp`)
  const mapper = mapMouse(false, (t, a, p) => pointIsInRange(a, t.w, t.h) ? !(t._wasOnClick = false) : t._wasOnClick = false, `on${dir}ClickUp`)
  createCrawler(`on${dir}MouseUp`, mapper, true)
})

window.addEventListener('mouseup', ({x, y, button}) => {
  mouseIsClicked = 0
  crawl('onMouseUp', {x, y, button})
  crawl(`on${mouseDirs[button]}MouseUp`, {x, y})
});

//onKey crawler
createCrawler('onKey')
window.addEventListener('keydown', event => {
  if (allowRepeatedKeyPressed || !event.repeat) {

    const output = getKey(event)
    const {name, key, keyCode} = output

    if (downKeys[name] || downKeys[keyCode]) {
      if (debugEnabled) console.warn(`Duplicate event!`, event);
      return
    }

    downKeys[name] = true
    downKeys[keyCode] = true

    crawl('onKey', output)

    if (key == '$') {
      debugEnabled = !debugEnabled
      masterLayer.changed = HARD
    }
  }
});

//onKeyUp crawler
createCrawler('onKeyUp')
window.addEventListener('keyup', event => {

  const output = getKey(event)
  const {key, name, keyCode} = output

  if (!downKeys[name] || !downKeys[keyCode]) {
    if (debugEnabled) console.warn(`Duplicate event!`, event);
    return
  }

  downKeys[name] = false
  downKeys[keyCode] = false

  crawl('onKeyUp', output)
});

function getKey(event) {
  const {key, keyCode, code } = event
  lowerKey = key.length == 1 ? key.toLocaleLowerCase() : key
  const name = names[lowerKey] || lowerKey

  return {key: lowerKey, originalKey: key, keyCode, code, event, name}
}

//wheel crawler
createCrawler('onWheel')
window.addEventListener('wheel', event => {
  crawl('onWheel', {dir: Math.sign(event.deltaY)})
});

createCrawler('onResize', t => t instanceof Layer)
window.addEventListener('resize', () => {
  const width = window.innerWidth
  const height = window.innerHeight

  crawl('onResize', {width, height, w: width, h: height})
});

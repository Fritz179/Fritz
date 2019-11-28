let debugEnabled = 0
let allowRepeatedKeyPressed = false
let mouseIsClicked = false

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
function createCrawler(eventName, allowed = () => true) { // global
  //move crawling parameters in this scope

  function crawl(target, arg, parent) {
    if (allowed(target, arg, parent)) {
      target[eventName](arg)
    }
    if (typeof target.forEachChild == 'function') {
      target.forEachChild(child => {
        crawl(child, Object.assign({}, arg), target)
      })
    }
  }

  crawlers[eventName] = (target, args) => {
    if (preloadCounter == 0) {
      // crawl(target, args, {x: 0, y: 0, xm: 1, ym: 1}) // parent == target
      crawl(target, args, target) // parent == target
    }
  }
}

//global function ta start a crawler
function crawl(...args) { // global
  const target = typeof args[0] == 'string' ? masterLayer : args.splice(0, 1)
  const eventName = args.splice(0, 1)

  if (!crawlers[eventName]) throw new Error(`Cannot crawl ${eventName}, us createCrawler() to define a crawler`)
  crawlers[eventName](target, args[0])
}

function mapMouse(drag, allow) {
  return (target, args, parent) => {
    if (target instanceof Layer) {
      const {xAlign, yAlign, overflow} = target.cameraMode

      args.x = (args.x - parent.w * xAlign) / target.xm + (target.x + target.w * xAlign)
      args.y = (args.y - parent.h * yAlign) / target.ym + (target.y + target.h * yAlign)
    } else {
      args.x = round(args.x / target.xm - target.x)
      args.y = round(args.y / target.ym - target.y)
    }

    if (drag) {
      args.xd = args.xd / target.xm
      args.yd = args.yd / target.ym
    }

    return allow ? allow(target, args, parent) : true
  }
}

//onMouse and onClick crawlers
// t, a, p = target, arg, parent
createCrawler('onMouse', mapMouse(false))
createCrawler('onClick', mapMouse(false, (t, a, p) => pointIsInRange(a, t.w, t.h) ? t._wasOnClick = true : false))
window.addEventListener('mousedown', ({x, y}) => {
  mouseIsClicked = true
  // debugger
  crawl('onMouse', {x, y})
  crawl('onClick', {x, y})
});

//onMouseDrag and onClickDrag crawlers
createCrawler('onMouseDrag', mapMouse(true))
createCrawler('onDrag', mapMouse(true))
createCrawler('onClickDrag', mapMouse(true, (t, a, p) => t._wasOnClick))
window.addEventListener('mousemove', ({movementX, movementY, x, y}) => {
  const args = {x, y, xd: movementX, yd: movementY}
  crawl('onDrag', Object.assign({}, args))
  if (mouseIsClicked) {
    crawl('onMouseDrag', Object.assign({}, args))
    crawl('onClickDrag', Object.assign({}, args))
  }
});

//onMouseUp and onClickUp crawlers
createCrawler('onMouseUp', mapMouse(false))
createCrawler('onClickUp', mapMouse(false, (t, a, p) => t._wasOnClick ? !(t._wasOnClick = false) : false))
window.addEventListener('mouseup', ({x, y}) => {
  mouseIsClicked = false
  crawl('onMouseUp', {x, y})
  crawl('onClickUp', {x, y})
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

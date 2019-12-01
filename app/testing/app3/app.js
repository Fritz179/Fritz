const timer = new Timer(60, fixedUpdate, update, false)
let masterLayer = new Layer()
// noiseSeed(420)

const {round, floor, ceil, PI, abs, min, max, sign} = Math
const random = (...args) => {
  if (args.length == 0) {
    return Math.random()
  } else if (args.length == 1) {
    if (Array.isArray(args[0])) {
      return args[0][Math.floor(Math.random() * min.length)]
    } else {
      return Math.random() * args[0]
    }
  } else {
    return Math.random() * (args[1] - args[0]) + args[0]
  }
}

function cap(value, max) {
  if (!(typeof max == 'number')) {
    throw new Error(`no cap value provided for ${value}`);
  } else if (abs(max) >= abs(value)) {
    return value
  } else {
    return max * sign(value)
  }
}

createCrawler('fixedUpdate')
function fixedUpdate() {
  crawl('fixedUpdate')
}

function update() {
  if (masterLayer.update() || masterLayer.changed || debugEnabled) {
    masterLayer.getSprite()
    masterLayer.changed = false
    return true
  }
}

function testPreloadCounter() {
  if (preloadCounter == 1) {
    masterLayer = new SpriteLayer('screen')
    setup()
    decrementPreloadCounter()
  } else {
    requestAnimationFrame(testPreloadCounter)
  }
}

window.addEventListener("load", () => {
  testPreloadCounter()
})


function addLayer(child) {
  masterLayer.addChild(child)
}

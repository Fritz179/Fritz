const timer = new Timer(60, fixedUpdate, update, false)
let masterLayer = new Layer()

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
    masterLayer.changed = false
    // console.log('drawing all');
    masterLayer.getSprite()
  }
  // console.log(masterLayer.game.frame);
}

window.addEventListener("load", () => {
  masterLayer = new Camera()
  setup()
  masterLayer.resize()
  decrementPreloadCounter()
})

window.addEventListener('resize', () => {
  masterLayer.resize()
})

function addLayer(child) {
  masterLayer.addChild(child)
}

class Camera extends SpriteLayer {
  constructor() {
    super('screen')
    this.setSize(1920, 1080)
  }

  resize() {
    const w = window.innerWidth
    const h = window.innerHeight
    const rw = w / 1920
    const rh = h / 1080

    const r = rw < rh ? rw : rh

    this.setSize(w, h)
  }

  getSprite() {
    this.clear()

    this.children.forEach(child => {
      const sprite = child.getSprite(this)
      if (sprite) {
        this.image(sprite, child.x + sprite.x, child.y + sprite.y)
      } else if (sprite !== false) {
        console.error(child, sprite)
        throw new Error(`illegal getsprite return!!`)
      }

      child.changed = false
    })

    return false
  }
}

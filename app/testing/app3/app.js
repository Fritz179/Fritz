const timer = new Timer(60, fixedUpdate, update, false)
let masterLayer = new Layer()

const {round, floor, ceil, PI, abs, min, max, sign, random} = Math

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
  masterLayer.update()

  masterLayer.getSprite()
}

window.addEventListener("load", () => {
  setup()
  masterLayer.resize()
  decrementPreloadCounter()
})

window.addEventListener('resize', () => {
  masterLayer.resize()
})

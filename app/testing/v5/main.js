loadSprite('player', './img/sprites')
loadSprite('tiles', {path: './img/sprites', type: 'tiles'})
let chunks = {}

function setup() {
  addLayer(new Main())
  addLayer(new Overlay())
}

class Overlay extends Layer {
  constructor() {
    super(1000, 100)
    this.x = 100
    // this.setScale(3, 3)
    this.background(255, 0, 0)
  }

  getSprite(ctx) {
    // ctx.fill('red')
    // ctx.rect(0, 0, 100, 1000)
    // return false
    return this.sprite
  }
}

class Main extends TileGame {
  constructor() {
    super()
    this.setSize(100, 100)
    this.setCameraMode({align: 'center', overflow: 'display'})
    this.zoom = 3
    this.setScale(this.zoom, this.zoom)

    this.player = new Player(0, (ceil(-noise(0) * 50)) * 16 - 24)
    this.addChild(this.player)

    this.setChunkLoader(1, 2)

    this.loadMap({
     width: 16,
     map: [
       0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
       0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
       0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
       0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
       0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
       0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
       0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
       0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0,
       0, 0, 0, 0, 0, 0, 2, 0, 2, 0, 0, 0, 0, 0, 0, 0,
       0, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 0,
       0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
       0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
       0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
       0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
       0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
       0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
     ]
   })

    this.fixedUpdate.addPre(() => { if (debugEnabled) logFPS() }, 60)
  }

  onMouse({x, y}) {
    this.setTileAt.cord(x, y, 0)
  }

  onWheel(dir) {
    this.zoom -= dir

    if (this.zoom <= 0) this.zoom = debugEnabled ? 0.5 : 1
    else if (this.zoom > 10) this.zoom = 10
    else this.zoom |= 0

    this.setSize(1920, 1080, this.zoom)
    masterLayer.changed = true

    const renderDistace = 4 / this.zoom
    this.setChunkLoader(renderDistace, 4)
  }

  chunkLoader(x, y) {
    const id = `${x}_${y}`
    if (chunks[id]) {
      return {map: chunks[id]}
    }

    const chunk = {map: []}

    for (let xb = 0; xb < 16; xb++) {
      for (let yb = 0; yb < 16; yb++) {
        chunk.map[xb + yb * 16] = tileAt(x * 16 + xb, y * 16 + yb)
      }
    }

    function tileAt(x, y) {
      let distToTop = noise(x / 20) * 50 + y

      if (distToTop < 0) return 0
      if (distToTop < 1) return 1
      if (distToTop < 4) return 2
      else return 3
    }

    return chunk
  }

  chunkOffloader(data, x, y) {
    const id = `${x}_${y}`
    chunks[id] = data
  }

  update() {
    this.setPos(0, 0)
    this.center = this.player.center
  }
}

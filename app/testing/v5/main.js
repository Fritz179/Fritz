loadSprite('player', './img/sprites')
loadSprite('tiles', {path: './img/sprites', type: 'tiles'})
let chunks = {}

function setup() {
  const player = new Player(0, (ceil(-noise(0) * 50)) * 16 - 24)
  addLayer(new Main(player))
  addLayer(new Overlay(player))
}

class Overlay extends Layer {
  constructor(player) {
    super()

    this.player = player
    this.setCameraMode({align: 'right-top', overflow: 'display'})
  }

  getSprite(ctx) {
    this.textSize(50)
    this.textFont('consolas')
    this.textAlign('right', 'top')

    const {x, y} = this.player
    const f = Math.floor

    this.text(`FPS: ${timer.fps}, UPS: ${timer.ups}`, -10, 10)
    this.text(`X: ${f(x)}, ${f(x / 16)}, ${f(x / 256)}`, -10, 60)
    this.text(`Y: ${f(y)}, ${f(y / 16)}, ${f(y / 256)}`, -10, 110)

    return false
  }
}

class Main extends TileGame {
  constructor(player) {
    super()

    this.zoom = 3
    this.setScale(this.zoom, this.zoom)
    this.setCameraMode({align: 'center', overflow: 'display'})

    this.player = player
    this.center = player.center
    this.addChild(player)

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

   this.setChunkLoader(2, 5)
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

    const d  = 6 / this.zoom
    this.setChunkLoader(d > 1 ? d : 1, 7)
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
    this.center = this.player.center
  }
}

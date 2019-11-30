loadSprite('player', './img/sprites')
loadSprite('pointer', './img/sprites')
loadSprite('slot', {path: './img/sprites', recursive: 2})
loadSprite('tiles', {path: './img/sprites'})
let chunks = {}
let player

function setup() {
  player = new Player(1600, (ceil(-noise(1600 / 320) * 50)) * 16 - 24)
  player.inventory = new Inventory()

  addLayer(new Main(player))
  addLayer(player.inventory)
  addLayer(new Overlay(player))
}

addCollision(Player, Drop)

function tp(x, y = false) {
  if (y === false) y = (ceil(-noise(x / 320) * 50)) * 16 - 24
  player.pos = {x, y}
}

class Main extends TileGame {
  constructor(player) {
    super('auto')

    this.zoom = 3
    this.setScale(this.zoom)
    this.setCameraMode({align: 'center', overflow: 'display'})

    this.player = player
    this.center = player.center
    this.addChild(player)

    this.addChild(this.pointer = new Pointer(player))

    this.loadMap({
     width: 16,
     data: [
       0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
       0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
       0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
       0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
       0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
       0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
       0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
       0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0,
       0, 0, 0, 0, 0, 0, 2, 0, 2, 0, 0, 0, 0, 0, 0, 0,
       0, 1, 1, 1, 1, 1, 2, 0, 2, 1, 1, 1, 1, 1, 1, 0,
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

  onDrag({x, y}) {
    this.pointer.moveTo(x, y)
  }

  onRightMouseBubble({x, y}) {
    this.placeBlock(x, y)
  }

  onRightMouseDragBubble({x, y}) {
    this.placeBlock(x, y)
  }

  placeBlock(x, y) {
    if (this.tileAt.cord(x, y) == 0) {
      const {selected, selectedSlot} = this.player.inventory

      if (selectedSlot.id) {
        this.setTileAt.cord(x, y, selectedSlot.id)
        this.player.inventory.getFromSlot(selected, 1)
      }
    }
  }

  onWheel({dir}) {
    this.zoom -= dir

    if (this.zoom <= 0) this.zoom = debugEnabled ? 0.5 : 1
    else if (this.zoom > 10) this.zoom = 10
    else this.zoom |= 0

    this.setScale(this.zoom)

    const d  = 6 / this.zoom

    this.setChunkLoader(d > 1 ? d : 1, 7)
  }

  chunkLoader(x, y) {
    const id = `${x}_${y}`
    if (chunks[id]) {
      return {data: chunks[id]}
    }

    const chunk = {data: []}

    for (let xb = 0; xb < 16; xb++) {
      for (let yb = 0; yb < 16; yb++) {
        chunk.data[xb + yb * 16] = tileAt(x * 16 + xb, y * 16 + yb)
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
    // const floor = Math.round
    // const {x, y} = this.player.center
    // this.center = {x: floor(x), y: floor(y)}
  }
}

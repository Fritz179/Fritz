loadSprite('player', './img/sprites')
loadSprite('pointer', './img/sprites')
loadSprite('slot', {path: './img/sprites', recursive: 2})
loadSprite('tiles', {path: './img/sprites'})
let player

function setup() {
  // player = new Player(0, 0)
  player = new Player(1600, (ceil(noise(1600 / 320) * 50)) * 16 - 24)
  player.inventory = new Inventory()

  addLayer(new Main(player))
  addLayer(player.inventory)
  addLayer(new Overlay(player))
}

addCollision(Player, Drop)

function tp(x, y = false) {
  if (y === false) y = (ceil(noise(x / 320) * 50)) * 16 - 24
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
    this.rightPressed = false
    this.mouse = {x: 0, y: 0}

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
    this.mouse = {x, y}
    this.lastPos = this.pos
    this.pointer.moveTo(x, y)
  }

  onRightMouseBubble({x, y}) {
    this.rightPressed = true
  }

  onRightMouseUp({x, y}) {
    this.rightPressed = false
  }

  placeBlock(x, y) {
    if (this.tileAt.cord(x, y) == 0 && this.noEntityAt.cord(x, y)) {
      const {selected, selectedSlot} = this.player.inventory

      if (selectedSlot.id) {
        this.setTileAt.cord(x, y, selectedSlot.id)
        this.player.inventory.getFromSlot(selected, 1)
      }
    }
  }

  onKey({name}) {
    switch (name) {
      case ',': this.changeZoom(-1); break;
      case '.': this.changeZoom(1); break;
    }
  }

  changeZoom(dir) {
    this.zoom -= dir

    if (this.zoom <= 0) this.zoom = debugEnabled ? 0.5 : 1
    else if (this.zoom > 10) this.zoom = 10
    else this.zoom |= 0

    this.setScale(this.zoom)

    const d  = 6 / this.zoom

    this.setChunkLoader(d > 1 ? d : 1, 7)
  }

  chunkLoader(x, y) {
    return getChunk(x, y)
  }

  chunkOffloader(data, x, y) {
    const id = `${x}_${y}`
    map.chunks[id] = data
  }

  update() {
    this.center = this.player.center

    if (this.rightPressed) {
      const {mouse, lastPos} = this
      this.placeBlock(mouse.x - lastPos.x + this.x, mouse.y - lastPos.y + this.y)
    }
  }
}

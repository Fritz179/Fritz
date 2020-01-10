loadSprite('player', './img/sprites')
loadSprite('pointer', './img/sprites')
loadSprite('tiles', './img/sprites')
loadSprite('items', './img/sprites')
loadSprite('slot', {path: './img/sprites', recursive: 2})
let main, redrawAll = false

noiseSeed(420)
function setup() {
  addLayer(main = new Main())
  const {player} = main

  addLayer(player.inventory = new Inventory())
  addLayer(main.hand)
  addLayer(new Overlay())

  player.inventory.add(100, 1)
  player.inventory.add(101, 1)
  player.inventory.add(102, 1)
  player.inventory.add(103, 1)
  player.inventory.add(9, 1000)
}

addCollision(Player, Drop)
addCollision(Furnace, Player)
addCollision(Drop, Drop)

function tp(x, y = false) {
  if (y === false) y = (ceil(noise(x / 320) * 50)) * 16 - 24
  main.player.pos = {x, y}
}

class Tile {
  constructor({name}) {
    tileNames[name] = this
  }

  get isPlacable() {
    return this.collision !== null
  }

  get isBreakable() {
    return this.collision !== null
  }
}

class Main extends TileGame {
  constructor() {
    super('auto')

    this.zoom = 3
    this.setScale(this.zoom)
    this.setCameraMode({align: 'center', overflow: 'display'})

    // create palyer
    this.player = new Player(1600, (ceil(noise(1600 / 320) * 50)) * 16 - 24)
    this.center = this.player.center
    this.addChild(this.player)

    // create player attachments
    this.pointer = this.addChild(new Pointer(this))
    this.hand = new Hand(this.pointer)

    this.chunkLoader = new MainChunkLoader()
    this.setChunkLoader(2, 5)
  }

  onDrag({x, y}) {
    this.pointer.offset.set(x - this.x, y - this.y)
  }

  onKey({name}) {
    switch (name) {
      case ',': this.changeZoom(-1); break;
      case '.': this.changeZoom(1); break;
    }
  }

  changeZoom(dir) {
    this.zoom -= dir

    if (this.zoom <= 0 && !debugEnabled) this.zoom = 1
    else if (this.zoom > 10) this.zoom = 10
    else this.zoom |= 0

    if (this.zoom <= 0) {
      this.zoom = 0
      this.setScale(1)
      this.setChunkLoader(1, 1)

    } else {
      const d = 6 / this.zoom

      this.setScale(this.zoom)
      this.setChunkLoader(d > 1 ? d : 1, 7)
    }
  }

  update() {
    this.center = this.player.center
  }

  onBlockPlaced({id, x, y, chunk, xc, yc}) {
    if (id == 9) {
      this.addChild(new Furnace(chunk, {x, y, xc, yc}))
    }
  }
}

addCordMiddleware(Main, 'placeBlockAt', 2)

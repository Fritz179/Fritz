loadSprite('player', './img/sprites')
loadSprite('pointer', './img/sprites')
loadSprite('tiles', './img/sprites')
loadSprite('slot', {path: './img/sprites', recursive: 2})
let main, player, hand

noiseSeed()
function setup() {
  // player = new Player(0, 0)
  player = new Player(1600, (ceil(noise(1600 / 320) * 50)) * 16 - 24)

  addLayer(main = new Main(player))
  addLayer(player.inventory = new Inventory(player))
  addLayer(hand = new Hand(main.pointer))
  addLayer(new Overlay(player))
}

addCollision(Player, Drop)

function tp(x, y = false) {
  if (y === false) y = (ceil(noise(x / 320) * 50)) * 16 - 24
  player.pos = {x, y}
}

class Main extends MapLoader {
  constructor(player) {
    super('auto')

    this.zoom = 3
    this.setScale(this.zoom)
    this.setCameraMode({align: 'center', overflow: 'display'})

    this.player = player
    this.center = player.center
    this.addChild(player)

    this.rightPressed = false
    this.mouse = {x: 0, y: 0}

    this.addMapModifier(generateTree, {chance: 4, min: 8, pre: 1, linear: true})
    this.addMapModifier(generateIronOrePach, {chance: 30, min: 10, pre: 1, linear: false})
    this.addMapModifier(generateDiamonOrePach, {chance: 500, min: 30, pre: 1, linear: false})
    this.baseChunkLoader = getBaseChunk
    this.setChunkLoader(2, 5)

    this.pointer = this.addChild(new Pointer(this))
    this.mouse = {x: 0, y: 0}
  }

  onDrag({x, y}) {
    this.mouse = {x, y}
    this.pointer.offset = {x: x - this.x, y: y - this.y}
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
      const d  = 6 / this.zoom

      this.setScale(this.zoom)
      this.setChunkLoader(d > 1 ? d : 1, 7)
    }
  }

  update() {
    this.center = this.player.center
  }
}

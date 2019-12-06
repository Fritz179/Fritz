class Pointer extends Canvas {
  constructor() {
    super()

    this.setSize(16, 16)
    this.spriteAction = 'idle'

    this.oldDiggingFor = 0
    this.diggingFor = 0
    this.digging = false
    this.offset = {x: 0, y: 0}

    this.pTileX = 0
    this.pTileY = 0
  }

  get tile() { return this.layer.tileAt.cord(this.x, this.y) }
  get tilePos() { return this.layer.cord(this.x, this.y) }
  get tileCord() { return this.tilePos.map(pos => pos * 16) }
  set tile(id) { this.layer.setTileAt.cord(this.x, this.y, id) }
  get overEntity() { return !this.layer.noEntityAt.cord(this.x, this.y) }

  get x() { return main.x + this.offset.x }
  get y() { return main.y + this.offset.y }
  set x(x) { }
  set y(y) { }

  fixedUpdate() {
    const [x, y] = this.tilePos

    if (this.pTileX != x || this.pTileY != y) {
      this.pTileX = x
      this.pTileY = y

      this.diggingFor = 0
      this.changed = true
    }

    const tile = this.tile

    if (tile < 1) {
      this.spriteAction = 'clear'
      this.diggingFor = 0
    } else {
      if (this.digging) {
        this.diggingFor++
        this.spriteAction = 'digging'

        if (this.diggingFor >= this.diggingTime(tile)) {
          this.diggingFor = this.diggingTime(tile)

          const [x, y] = this.tileCord
          main.addChild(new Drop(x + this.w / 2, y + this.h / 2, tile))
          this.tile = 0
        }

        this.spriteFrame = ceil(6 * this.diggingFor / this.diggingTime(tile)) - 1
      } else {
        this.spriteAction = 'idle'
      }
    }
  }

  update() {
    return this.digging
  }

  diggingTime(tile) {
    return player.creative ? 1 : [0, 20, 20, 60, 20, 20][tile]
  }

  onLeftMouseBubble() {
    this.digging = true
  }

  onLeftMouseUp() {
    this.digging = false
  }

  getSprite(ctx) {
    if (this.spriteAction != 'clear') {
      if (this.spriteAction == 'idle') {
        ctx.image(sprites.pointer.idle, ...this.tileCord)
      } else {
        ctx.image(sprites.pointer.digging[this.spriteFrame], ...this.tileCord)
      }
    }

    return false
  }
}

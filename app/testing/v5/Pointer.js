class Pointer extends Entity {
  constructor(player) {
    super()
    this.setSprite('pointer')
    this.setSize(16, 16)
    this.spriteAction = 'idle'

    this.player = player
    this.xOff = 0
    this.yOff = 0
    this.diggingFor = 0
    this.digging = false
  }

  moveTo(x, y) {
    this.xOff = this.layer.x - x
    this.yOff = this.layer.y - y
  }

  update() {
    const old = {x: this.x / 16, y: this.y / 16}
    const [x, y] = this.layer.cord(this.layer.x - this.xOff, this.layer.y - this.yOff)
    const tile = this.layer.tileAt(x, y)

    if (x != old.x || y != old.y) {
      if (tile) {
        this.setPos(x * 16, y * 16)
      }
      this.diggingFor = 0
    }

    if (tile < 1) {
      this.spriteAction = 'clear'
      this.diggingFor = 0
    } else {
      if (this.digging) {
        this.diggingFor++
        this.spriteAction = 'digging'

        if (this.diggingFor >= this.diggingTime(tile)) {
          this.diggingFor = this.diggingTime(tile)
          this.layer.addChild(new Drop(this.x + this.w / 2, this.y + this.h / 2, tile))
          this.layer.setTileAt(x, y, 0)
        }

        this.spriteFrame = ceil(6 * this.diggingFor / this.diggingTime(tile)) - 1


      } else {
        this.spriteAction = 'idle'
      }
    }
  }

  diggingTime(tile) {
    return this.player.creative ? 1 : [0, 20, 20, 60, 20, 20][tile]
  }

  onLeftMouse() {
    this.digging = true
  }

  onLeftMouseUp() {
    this.digging = false
  }

  getSprite() {
    if (this.spriteAction == 'clear') {
      return false
    }
  }
}

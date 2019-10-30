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
    this.setPos(x * 16, y * 16)

    if (x != old.x || y != old.y) {
      this.updateDiggingTile(x, y)
    }

    if (!this.layer.tileAt(x, y)) {
      this.spriteAction = 'clear'
      this.updateDiggingTile(x, y)
    } else {
      if (this.digging) {
        this.diggingFor++
        this.spriteAction = 'digging'

        if (this.diggingFor >= this.diggingTime) {
          this.layer.setTileAt(x, y, 0)
        }

        this.spriteFrame = ceil(6 * this.diggingFor / this.diggingTime) - 1
      } else {
        this.spriteAction = 'idle'
      }
    }
  }

  updateDiggingTile(x, y) {
    console.log();
    this.diggingFor = 0
    this.diggingTime = this.player.creative ? 1 : [0, 20, 20, 60][this.layer.tileAt(x, y)]
  }

  onClick() {
    this.digging = true
  }

  onClickUp() {
    this.digging = false
  }

  getSprite() {
    if (this.spriteAction == 'clear') {
      return false
    }
  }
}

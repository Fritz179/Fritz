class Furnace extends Body {
  constructor(chunk, {x, y, xc, yc}) {
    super()
    this.location = {xc, yc}
    this.chunk = chunk
    chunk.attach(this)

    this.setPos(x * 16, y * 16)
    this.setSize(16, 16)
    this.setTrigger(-32, -32, 80, 80)
    this.lit = false
    this.wasLit = false
  }

  getSprite() {
    return false
  }

  fixedUpdate() {

    if (this.lit != this.wasLit) {
      this.chunk.setTileAt(this.location.xc, this.location.yc, this.lit ? 10 : 9)
      // main.setTileAt(this.location.x, this.location.y, this.lit ? 10 : 9)
      this.wasLit = this.lit
    }

    this.lit = false
  }

  onEntityCollision({name, entity}) {
    if (name == 'Player') {
      this.lit = true
    }
  }

  serialize() {
    const {xc, yc} = this.location

    return {x: this.x / 16, y: this.y / 16, xc, yc}
  }
}

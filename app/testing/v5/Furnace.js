class Furnace extends Body {
  constructor(x, y) {
    super()
    this.location = {x, y}
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
      main.setTileAt(this.location.x, this.location.y, this.lit ? 10 : 9)
      this.wasLit = this.lit
    }

    this.lit = false
  }

  onEntityCollision({name, entity}) {
    if (name == 'Player') {
      this.lit = true
    }
  }
}

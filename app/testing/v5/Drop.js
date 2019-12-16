class Drop extends Entity {
  constructor(x, y, type) {
    super(x, y, 16 / 2, 16 / 2)

    this.setDrag(0.95, 0.99)
    this.setVel(random(-5, 5), random(-6, -4))
    this.lifeTime = 360
    this.pickupTime = 10
    this.collideWithMap = true

    this.blockId = type
    this.ya = 0.25
  }

  fixedUpdate({updatePhisics}) {
    updatePhisics()
    this.pickupTime--
  }

  getSprite(ctx) {
    ctx.image(tiles[this.blockId].sprite, this.x, this.y, 16 / 2, 16 / 2)

    return false
  }
}

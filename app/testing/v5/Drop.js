class Drop extends Entity {
  constructor(x, y, type) {
    super(x, y, 16 / 3, 16 / 3)

    this.setSprite('tiles')
    this.setDrag(0.95, 0.99)
    this.setVel(random(-5, 5), random(-6, -4))
    this.lifeTime = 360

    this.blockId = type
    this.ya = 0.25
  }

  getSprite(ctx) {
    ctx.image(this.sprite[this.blockId], this.x, this.y, 16 / 3, 16 / 3)

    return false
  }
}

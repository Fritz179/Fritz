class Drop extends Entity {
  constructor(x, y, type, quantity = 1) {
    super(x, y, 16 / 2, 16 / 2)

    this.setDrag(0.95, 0.99)
    this.setVel(random(-5, 5), random(-6, -4))
    this.maxLifeTime = 360
    this.lifeTime = this.maxLifeTime
    this.pickupTime = 10
    this.collideWithMap = true

    this.blockId = type
    this.quantity = quantity
    this.ya = 0.25

    this.triggerBox.set(-5, -5, 18, 18)
  }

  onEntityCollision({name, entity}) {
    if (name == 'Drop') {
      if (this.blockId == entity.blockId && entity.pickupTime < 0 && this.pickupTime < 0) {
        this.lifeTime = this.maxLifeTime
        this.quantity += entity.quantity
        entity.despawn()
      }
    }
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

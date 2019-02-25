class Shooter extends Animation {
  constructor(x, y) {
    super()
    this.setSprite(sprites.shooter.idle_left)
    this.setPos(x * 16, y * 16)
    this.setSize(16, 16)
    this.lifetime = 0
    this.maxLifetime = 250
  }

  update() {
    this.lifetime ++
    if (this.lifetime >= this.maxLifetime) {
      this.lifetime = 0
      spawners.shooter.spawn(this.x / 16 - 1, this.y / 16)
      this.kill()
    }
  }

  getSprite() {
    return this.sprite[floor(this.lifetime / this.maxLifetime * this.sprite.length)]
  }
}

class Bullets extends Animation {
  constructor(x, y) {
    super()
    this.setSprite(sprites.shooter)
    this.setPos(x * 16, y * 16)
    this.setSize(16, 16)
    this.lifetime = 0
    this.maxLifetime = 250
  }

  update() {
    this.lifetime ++
    if (this.lifetime >= this.maxLifetime) {
      this.lifetime = 0
      console.log('ppppp');
    }
  }

  getSprite() {
    return this.sprite.idle[floor(this.lifetime / this.maxLifetime * this.sprite.idle.length)]
  }
}

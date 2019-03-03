class Shooter extends Block {
  constructor(x, y, r) {
    super()
    this.setSprite(sprites.shooter)
    this.setPos(x * 16, y * 16)
    this.r = r
    this.setSize(16, 16)
    this.lifetime = 0
    this.maxLifetime = 250
  }

  update() {
    this.lifetime ++
    if (this.lifetime >= this.maxLifetime) {
      this.lifetime = 0
      spawners.bullet.spawn(this.x, this.y + 8)
    }
  }

  getSprite() {
    return this.sprite.idle[floor(this.lifetime / this.maxLifetime * this.sprite.idle.length)][this.r]
  }


  onCollisionEntry() { }
}

class Bullet extends Entity {
  constructor(x, y) {
    super()
    this.setSprite(sprites.bullet)
    this.setPos(x - 3, y - 3)
    this.setSize(6, 6)
    this.setVel(-5, 0)
    this.dying = false
    this.deadTime = 0
    this.maxDeadTime = 30
  }

  update() {
    if (this.dying) {
      this.deadTime++
      if (this.deadTime >= this.maxDeadTime) {
        this.kill()
      }
    }
  }

  onMapCollision({solveCollision}) {
    solveCollision()
    this.die()
  }

  getSprite() {
    if (!this.dying) {
      return this.sprite.idle
    } else {
      return this.sprite.dying[floor(this.deadTime / this.maxDeadTime * this.sprite.dying.length)]
    }
  }

  onCollisionEntry({stopOtherCollision}) {
    stopOtherCollision()
  }

  onCollisionExit() {
    this.die()
    return true
  }

  die() {
    this.changeParentName('animations')
    this.dying = true
    this.setSize(6, 16)
    this.setVel(0, 0)
    this.setPos(this.x, this.y - 5)
  }
}

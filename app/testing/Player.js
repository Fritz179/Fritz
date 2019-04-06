class Player extends Entity {
  constructor(x, y, status) {
    super()
    this.setSize(16, 16)
    this.setPos(x, y)
    this.speed = 15
    this.setVel(this.speed, this.speed)
    this.spriteDir = 0
    status.camera.follow(this)
    this.listen('onKey')
  }

  fixedUpdate() {
    // console.log(this.sprite);
  }

  update() {
    // console.log(this.x, this.y);
    // if (this.y > maps.h * maps.s) this.y = 0
    // if (this.y < 0) this.y = maps.h * maps.s
    // if (this.x > maps.w * maps.s) this.x = 0
    // if (this.x < 0) this.x = maps.w * maps.s
  }

  onKey(input) {
    switch (input) {
      case 'up': if (!this.moving) {this.setVel(0, -this.speed); this.spriteDir = 2;} break;
      case 'right': if (!this.moving) {this.setVel(this.speed, 0); this.spriteDir = 3;} break;
      case 'down': if (!this.moving) {this.setVel(0, this.speed); this.spriteDir = 0;} break;
      case 'left': if (!this.moving) {this.setVel(-this.speed, 0); this.spriteDir = 1;} break;
      case 'p': console.log(this.x, this.y, this.xv, this.yv); break;
      case 'Escape': setCurrentStatus('mainMenu'); break;
    }
  }

  onCollision({collider, stopCollison, stopOtherCollision}) {
    switch (collider.className) {
      case 'bullet': console.log('damaged'); break;
      case 'end': setCurrentStatus('levelSelection'); break;
      default: console.log('colliding with', collider.className);
    }
  }

  getSprite() {
    return this.sprite.idle[this.spriteDir]
  }
}

class End extends Entity {
  constructor(x, y) {
    super()
    this.setPos(x * 16, y * 16)
    this.setSize(16, 16)
    this.lifetime = 0
    this.maxLifetime = 20
  }

  update() {
    this.lifetime ++
    if (this.lifetime >= this.maxLifetime) this.lifetime = 0
  }

  onCollision({stopCollision}) { stopCollision() }

  getSprite() {
    return this.sprite.idle[floor(this.lifetime / this.maxLifetime * this.sprite.idle.length)]
  }
}

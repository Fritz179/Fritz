class Player extends Entity {
  constructor() {
    super()
    this.setSprite(sprites.player)
    this.setSize(16, 16)
    this.speed = 15
    this.setVel(this.speed, this.speed)
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

  onInput(input) {
    switch (input) {
      case 'up': if (!this.moving) this.setVel(0, -this.speed); break;
      case 'right': if (!this.moving) this.setVel(this.speed, 0); break;
      case 'down': if (!this.moving) this.setVel(0, this.speed); break;
      case 'left': if (!this.moving) this.setVel(-this.speed, 0); break;
      case 'p': console.log(this.x, this.y, this.xv, this.yv); break;
    }
  }

  onCollisionEntry(event) {
    //console.log('colliding with', event.collider.className);
  }

  getSprite() {
    return this.sprite.idle
  }
}

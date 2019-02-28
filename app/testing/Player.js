class Player extends Entity {
  constructor() {
    super()
    this.setSprite(sprites.player)
    this.setSize(16, 16)
    this.speed = 15
    this.setVel(this.speed, this.speed)
    this.spriteDir = 0
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
      case 'up': if (!this.moving) {this.setVel(0, -this.speed); this.spriteDir = 2;} break;
      case 'right': if (!this.moving) {this.setVel(this.speed, 0); this.spriteDir = 3;} break;
      case 'down': if (!this.moving) {this.setVel(0, this.speed); this.spriteDir = 0;} break;
      case 'left': if (!this.moving) {this.setVel(-this.speed, 0); this.spriteDir = 1;} break;
      case 'p': console.log(this.x, this.y, this.xv, this.yv); break;
    }
  }

  onCollisionEntry({collider, stopCollison, stopOtherCollision}) {
    switch (collider.className) {
      case 'bullet':
        console.log('damaged');
        break;
      default:
      console.log('colliding with', collider.className);
    }
  }

  onCollisionExit() { }

  getSprite() {
    return this.sprite.idle[0]
  }
}

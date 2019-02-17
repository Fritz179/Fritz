function initEntity() {
  class Master {
    constructor() {
      this.x = this.y = 0
      this.xv = this.yv = 0
      this.xa = this.ya = 0
      this.w = this.h = 16

      this.className = this.constructor.className
      this.parentName = this.constructor.parentName
      this._id = random()
    }

    setPos(x, y) { this.x = x; this.y = y }
    setVel(xv, yv) { this.xv = xv; this.yv = yv }
    setAcc(xa, ya) { this.xa = xa; this.ya = ya }
    setSize(w, h) { this.w = w; this.h = h }

    update() { }
    fixedUpdate() { }

    get x1() { return this.x }
    get y1() { return this.y }
    get x2() { return this.x + this.w }
    get y2() { return this.y + this.h }

    set x1(x) { this.x = x }
    set y1(y) { this.y = y }
    set x2(x) { this.x = x - this.w }
    set y2(y) { this.y = y - this.h }
  }

  class Animation extends Master {
    constructor(sprite) {
      super()

      this.sprite = sprite || createDefaultTexture()
    }

    setSprite(sprite) { this.sprite = sprite }
    getSprite() { return this.sprite }
  }

  class Hitbox extends Master {
    constructor() {
      super()

    }

    onCollisionEntry() {
      console.error(`${this.tag}, hitbox without onCollisionEntry`)
    }
  }

  class Entity extends Animation {
    constructor() {
      super()
    }

    onCollisionEntry() {
      console.error(`${this.tag}, entity without onCollisionEntry`)
    }

    onHitboxEntry() { }

    onMapCollision(side, x, y, s) {
      console.log(side, x, y, s);
      switch (side) {
        case 'top':
          this.x2 = x * s
          this.yv = 0
          break;
        case 'right':
          this.x2 = x * s
          this.xv = 0
          break;
        case 'bottom':
          this.y2 = y * s
          this.yv = 0
          break;
        case 'left':
          this.x2 = x * s
          this.xv = 0
          break;
        default: throw new Error('invalid collision side', side, x, y, s, this)
      }
    }

    get moving() { return this.xv || this.yv }
  }

  fritz.Animation = Animation
  fritz.Hitbox = Hitbox
  fritz.Entity = Entity
}

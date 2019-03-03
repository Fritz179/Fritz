class Master {
  constructor() {
    this.x = this.y = 0
    this.xd
    this.xv = this.yv = 0
    this.xa = this.ya = 0
    this.w = this.h = 16

    this.className = this.constructor.className
    this.parentName = this.constructor.parentName
    this._id = random()
  }

  setPos(x, y) { this.x = x; this.y = y; return this }
  setVel(xv, yv) { this.xv = xv; this.yv = yv; return this }
  setAcc(xa, ya) { this.xa = xa; this.ya = ya; return this }
  setSize(w, h) { this.w = w; this.h = h; return this }

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

class Hitbox extends Master {
  constructor() {
    super()
  }

  onCollisionEntry() {
    console.error(`hitbox: ${this.className}, without onCollisionEntry`)
    this.onCollisionEntry = () => { }
  }
}

class Animation extends Master {
  constructor(sprite) {
    super()

    this.sprite = sprite || createDefaultTexture()
  }

  setSprite(sprite) { this.sprite = sprite }
  getSprite() { return this.sprite }
}

class Block extends Animation {
  constructor() {
    super()
  }

  onCollisionEntry() {
    console.error(`${this.parentName}: ${this.className}, without onCollisionEntry`)
    this.onCollisionEntry = () => { }
  }

  onCollisionExit() { }
}

class Entity extends Block {
  constructor() {
    super()
  }

  onBlockEntry() {
    console.error(`entity: ${this.className}, without onBlockEntry`)
    this.onCollisionEntry = () => { }
  }

  onBlockExit() { }

  onHitboxEntry() { }

  _onMapCollision(side, x, y, s) {
    if (debugEnabled) console.log(side, x, y, s, typeof this.onMapCollision == 'function');

    if (typeof this.onMapCollision == 'function') {
      this.onMapCollision({solveCollision: solveCollision.bind(this)})
    } else {
      solveCollision.call(this)
    }

    function solveCollision() {
      switch (side) {
        case 'top':
        this.y1 = (y + 1) * s
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
        this.x1 = (x + 1) * s
        this.xv = 0
        break;
        default: throw new Error('invalid collision side', side, x, y, s, this)
      }
    }
  }

  get moving() { return this.xv || this.yv }
}

p5.prototype.Animation = Animation
p5.prototype.Hitbox = Hitbox
p5.prototype.Entity = Entity
p5.prototype.Block = Block

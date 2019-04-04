class Master {
  constructor() {
    this.x = this.y = 0
    this.xd
    this.xv = this.yv = 0
    this.xa = this.ya = 0
    this.w = this.h = 16
    this.w2 = this.h2 = 0
  }

  setPos(x, y) { this.x = x; this.y = y; return this }
  setVel(xv, yv) { this.xv = xv; this.yv = yv; return this }
  setAcc(xa, ya) { this.xa = xa; this.ya = ya; return this }
  setSize(w, h) { this.w = w; this.h = h; return this }
  setCord({x1, y1, x2, y2}) { this.x = x1; this.y = y1; return this.setSize(x2 - x1, y2 - y1) }
  setDiff(w2, h2) { this.w2 = w2, this.h2 = h2 }

  listen(...toListen) { p5.prototype.addListener(this, ...toListen) }
  unListen() { p5.prototype.removeListener(this) }
  unListenTo(...toUnListen) { p5.prototype.removeListenerTo(this, ...toUnListen) }

  update() { }
  fixedUpdate() { }

  get x1() { return this.x }
  get y1() { return this.y }
  get x2() { return this.x + this.w }
  get y2() { return this.y + this.h }

  get w1() { return this.w }
  get h1() { return this.h }
  get x3() { return this.x + this.w2 }
  get y3() { return this.y + this.h2 }

  set x1(x) { this.x = x }
  set y1(y) { this.y = y }
  set x2(x) { this.x = x - this.w }
  set y2(y) { this.y = y - this.h }
}

class Animation extends Master {
  constructor(sprite) {
    super()
    this.killed = false

    this.sprite = sprite || createDefaultTexture()
  }

  setSprite(sprite) { this.sprite = sprite }
  getSprite() { return this.sprite }

  die() {
    this.killed = true
    entitiesToKill.push(this)
  }

  setType(type) {
    if (type != 'animations' && type != 'entitites') throw new Error(`Invalid new type: ${type}, available: animations, entitites`)

    this.killed = true
    entitiesToChange.set(this, type)
  }
}

class Entity extends Animation {
  constructor() {
    super()
  }

  onCollision() {
    console.error(`${this.parentName}: ${this.className}, without onCollision`)
    this.onCollision = () => { }
  }

  _onMapCollision(side, x, y, s) {
    if (debugEnabled) console.log(side, x, y, s, typeof this.onMapCollision == 'function');

    if (typeof this.onMapCollision == 'function') {
      this.onMapCollision({solveCollision: solveCollision.bind(this)})
    } else {
      solveCollision.call(this)
    }

    function solveCollision() {
      switch (side) {
        case 'top': this.y1 = (y + 1) * s; this.yv = 0; break;
        case 'right': this.x2 = x * s; this.xv = 0; break;
        case 'bottom': this.y2 = y * s; this.yv = 0; break;
        case 'left': this.x1 = (x + 1) * s; this.xv = 0; break;
        default: throw new Error('invalid collision side', side, x, y, s, this)
      }
    }
  }

  get moving() { return this.xv || this.yv }
}

p5.prototype.Animation = Animation
p5.prototype.Entity = Entity

class TriggerBox extends Block {
  constructor(body) {
    super()

    // if (h == 'circle') {
    //   this.shape = 'circle'
    // } else {
    //   this.shape = 'rect'
    // }

    this.offPos = new Vec2(0, 0)
    this.offSize = new Vec2(0, 0) // x = w, y = h
    this.body = body
  }

  set(xOff, yOff, w, h) {
    this.offPos.set(xOff, yOff)
    this.offSize.set(w, h)
  }

  get x() { return this.body.x + this.offPos.x }
  get y() { return this.body.y + this.offPos.y }
  get w() { return this.offSize.x || this.body.w }
  get h() { return this.offSize.y || this.body.h }

  // set x(x) { this.offPos = x - this.body.x }
  // set y(y) { this.offPos = y - this.body.y }
  // set w(w) { this.offSize.x = w }
  // set h(h) { this.offSize.y = h }
  set x(x) { }
  set y(y) { }
  set w(w) { }
  set h(h) { }

  getSprite() {
    return false
  }
}

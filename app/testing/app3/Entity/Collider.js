class Collider extends Body {
  constructor(x, y, w, h, shape = 'rect') {
    super(x, y, w, h)

    this.shape = shape
  }

  fixedUpdate() {
    if (this.shape == 'circle') {

    } else if (this.shape = 'rect') {

    } else {
      throw new Error(`Invalid shape: ${this.shape}`)
    }
  }

  getSprite() {
    return false
  }
}

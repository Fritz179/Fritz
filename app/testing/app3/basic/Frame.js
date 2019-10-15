const DEFAULT_TEXTURE = null

class Frame extends Block {
  constructor(x, y, w, h) {
    super(x, y, w, h)
    this.xm = 1
    this.ym = 1

    this._wasOnClick = false
    this._posChanged = true

    createMiddlwere(this, 'update')
    createMiddlwere(this, 'fixedUpdate')
    createMiddlwere(this, 'getSprite')
  }

  set x(x) { this._x = x; this._posChanged = true }
  set y(y) { this._y = y; this._posChanged = true }
  set changed(bool = false) { this._posChanged = bool }

  get x() { return this._x }
  get y() { return this._y }
  get changed() { return this._posChanged }

  get changed() { return this._posChanged }
  set changed(bool = false) { this._posChanged = bool }

  onKey(key) { }
  onKeyUp(key) { }
  onMouse(x, y) { }
  onMouseDrag(x, y, dx, dy) { }
  onMouseUp(x, y, dx, dy) { }
  onDrag(x, y, dx, dy) { }
  onClick(x, y) { }
  onClickDrag(x, y, dx, dy) { }
  onClickUp(x, y, dx, dy) { }
  onWheel(dir) { }
}

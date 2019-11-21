const DEFAULT_TEXTURE = null
const SOFT = 1
const HARD = 2

class Frame extends Block {
  constructor(x, y, w, h) {
    super(x, y, w, h)
    this.px = x
    this.py = y
    this.xm = 1
    this.ym = 1

    this._wasOnClick = false
    this.sprite = null
    this.layer = null
    this._changed = 0

    createMiddlwere(this, 'update')
    createMiddlwere(this, 'fixedUpdate')
    createMiddlwere(this, 'getSprite')

    this.fixedUpdate.addPost(() => {
      if (this.x != this.px || this.y != this.py) {
        this.changed = SOFT
        this.px = this.x
        this.py = this.y
      }
    })
  }

  get changed() { return this._changed }
  get softChanged() { return this._changed == SOFT }
  get hardChanged() { return this._changed == HARD }

  set changed(level = SOFT) {
    if (level === false) this._changed = 0
    else if (level > this._changed) this._changed = level
  }

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

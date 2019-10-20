const DEFAULT_TEXTURE = null

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
    this._posChanged = true
    this._spriteChanged = true

    createMiddlwere(this, 'update')
    createMiddlwere(this, 'fixedUpdate')
    createMiddlwere(this, 'getSprite')

    this.fixedUpdate.addPost(() => {
      if (this.x != this.px || this.y != this.py) {
        this._posChanged = true
        this.px = this.x
        this.py = this.y
      }
    })
  }

  get changed() { return this._posChanged || this._spriteChanged }
  set changed(bool = false) { this._posChanged = this._spriteChanged = bool }

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

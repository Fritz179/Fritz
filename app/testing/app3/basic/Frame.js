const DEFAULT_TEXTURE = null
const SOFT = 1
const HARD = 2

class Frame extends Block {
  constructor(x, y, w, h) {
    super(x, y, w, h)
    this.prev = new prevVec(x, y)
    this.mult = new multVec(1, 1)

    this._wasOnClick = false
    this.sprite = null
    this.layer = null
    this.changed = true

    createMiddleware(this, 'update')
    createMiddleware(this, 'fixedUpdate')
    createMiddleware(this, 'getSprite')
  }

  fixedUpdateBubble() {
    if (this.x != this.px || this.y != this.py) {
      this.changed = true
      this.px = this.x
      this.py = this.y
    }
  }

  onKey(key) { }
  onKeyUp(key) { }

  onDrag(x, y, dx, dy) { }
  onWheel(dir) { }
};

['Mouse', 'Click'].forEach(name => {
  ['', 'Drag', 'Up'].forEach(action => {
    ['', 'Left', 'Middle', 'Right'].forEach(dir => {
      Frame.prototype[`on${dir}${name}${action}`] = () => { }
      Frame.prototype[`on${dir}${name}${action}Bubble`] = () => { }
    })
  })
})

const prevVec = addVec2(Frame, 'prev', 'px', 'py')
const multVec = addVec2(Frame, 'mult', 'xm', 'ym')

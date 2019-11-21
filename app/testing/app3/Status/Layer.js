class Layer extends Canvas {
  constructor(...args) {
    super(...args)
    this.children = new Set()
    this.cameraMode = {xAlign: 0.5, yAlign: 0.5, overflow: 'dispaly'}

    this.getSprite.addPre((parentSprite) => {
      // always update ctx, to draw image on right place
      if (!this.buffer) {
        this.sprite = parentSprite
      }
    })
  }

  setCameraMode({align, overflow}) {
    const xTable = {left: 0, right: 1, center: 0.5}
    const yTable = {top: 0, bottom: 1, center: 0.5}
    if (align == 'center') align = 'center-center'
    else if (align == 'top') align = 'center-top'
    else if (align == 'right') align = 'right-center'
    else if (align == 'bottom') align = 'center-bottom'
    else if (align == 'left') align = 'left-center'

    this.cameraMode.xAlign = xTable[align.split('-')[0]] || 0
    this.cameraMode.yAlign = yTable[align.split('-')[1]] || 0
    this.cameraMode.overflow = overflow
  }

  addChild(child, layer) {
    if (this.children.has(child)) {
      console.warn('Layer already has child: ', child)
    } else {
      this.children.add(child)
      child.layer = this
    }
  }

  deleteChild(child) {
    if (!this.children.delete(child)) {
      console.warn('Cannot remove unexisting child: ', child);
    } else {
      child.layer = null
      this.changed = HARD
    }
  }

  clearChildren() {
    this.children.forEach(child => {
      child.layer = null
    })
    this.children.clear()
    this.changed = HARD
  }

  setChild(child) {
    this.clearChildren()
    this.addChild(child)
  }

  forEachChild(fun) {
    let i = 0
    this.children.forEach((value, key, set) => {
      fun(key, i++, set)
    })
  }
}

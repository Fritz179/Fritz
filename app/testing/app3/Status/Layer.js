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
    if (align == 'top') align = 'center-top'
    if (align == 'right') align = 'right-center'
    if (align == 'bottom') align = 'center-bottom'
    if (align == 'left') align = 'left-center'

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
    }
  }

  clearChildren() {
    this.children.forEach(child => {
      child.layer = null
    })
    this.children.clear()
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

class SpriteLayer extends Layer {
  constructor(...args) {
    super(...args)

    // update
    this.update.addPost((args, ret) => {
      let changed = ret || this.changed || false

      this.children.forEach(child => {
        const updated = child.update(this)

        if (updated || child.changed) {
          child.changed = false
          changed = true
        }
      })

      return this.changed = changed
    })

    // getSprite
    this.getSprite.addPost((ctx, ret) => {
      if (ret === false) return false

      // begin bubble process
      this.children.forEach(child => {
        if (debugEnabled) this.drawHitbox(...child.frame, 'green')
        const sprite = child.getSprite(this.sprite)
        if (sprite) {
          this.image(sprite, child.x + sprite.x, child.y + sprite.y)
        } else if (sprite !== false) {
          console.error(child, sprite)
          throw new Error(`illegal getsprite return!!`)
        }
      })

      if (!this.buffer) {
        return false
      } else {
        return this.sprite
      }
    })
  }
}

class BackgroundLayer {
  constructor(img) {
    this.img = img
    this.changed = true
  }

  setBackground(img) {
    this.img = img
    this.changed = true
  }

  update() {
    return this.cahnged
  }

  getSprite(ctx) {
    ctx.draw(this.img, 0, 0, this.img.width, this.img.height)

    this.changed = false
  }
}

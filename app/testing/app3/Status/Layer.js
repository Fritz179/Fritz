class Layer extends Canvas {
  constructor(...args) {
    super(...args)
    this.children = new Set()

    this.getSprite.addPre((ctx) => {
      // always update ctx, to draw image on right place
      if (!this.buffer) {
        this.ctx = ctx
      }
    })
  }

  addChild(child, layer) {
    if (this.children.has(child)) {
      console.warn('Layer already has child: ', child)
    } else {
      this.children.add(child)
    }
  }

  deleteChild(child) {
    if (!this.children.delete(child)) {
      console.warn('Cannot remove unexisting child: ', child);
    }
  }

  clearChildren() {
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
    this.update.addPost(() => {
      let changed = false

      this.children.forEach(child => {
        const updated = child.update(this)

        if (updated || child.changed) {
          child.changed = false
          changed = true
        }
      })

      return this.changed = changed
    })

    this.fixedUpdate.addPost(() => {
      this.forEachChild(child => {
        if (child.autoMove) {
          // add acceleration to velocity
          child.xv += child.xa
          child.yv += child.ya

          //add drag to velocity
          child.xv *= child.xd
          child.yv *= child.yd
          if (abs(child.xv) < child._minVel) child.xv = 0
          if (abs(child.yv) < child._minVel) child.yv = 0

          if (child.collideWithMap && this._isMap) {
            //check collsison for each axis
            child.x += child.xv
            this.collideMap(child, 1)
            child.y += child.yv
            this.collideMap(child, 2)
          } else {
            // add only velocity to position
            child.x += child.xv
            child.y += child.yv
          }
        }
      })
    })

    // getSprite
    this.getSprite.addPost((ctx, ret) => {
      if (ret === false) return false

      // begin bubble process
      this.children.forEach(child => {
        if (debugEnabled) this.drawHitbox(...child.frame, 'green')
        const sprite = child.getSprite(this.ctx)
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
        return this.canvas
      }
    })
  }
}

class BackgroundLayer {
  constructor(img) {
    this.img = img
    this.cahnged = true
  }

  setBackground(img) {
    this.img = img
    this.cahnged = true
  }

  update() {
    return this.cahnged
  }

  getSprite(ctx) {
    ctx.draw(this.img, 0, 0, this.img.width, this.img.height)

    this.changed = false
  }
}

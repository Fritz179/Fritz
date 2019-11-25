class SpriteLayer extends Layer {
  constructor(...args) {
    super(...args)

    // fixedUpdate
    // this.fixedUpdate.addPre(() => {
    //
    // })

    // update
    this.update.addPost((args, ret = 0) => {
      this.changed = ret

      this.children.forEach(child => {
        const updated = child.update(this)

        if (updated || child.changed) {
          this.changed = HARD
        }
      })

      return this.changed
    })

    // getSprite
    this.getSprite.addPost((ctx, ret) => {
      if (ret === false) return false

      // begin bubble process
      this.children.forEach(child => {
        if (!child.hardChanged && child.buffer) {
          this.image(child, 0, 0)
        } else {
          const sprite = child.getSprite(this)

          if (sprite) {
            if (child instanceof Layer) {
              this.image(sprite, 0, 0)
            } else {
              this.image(sprite, child.x + sprite.x, child.y + sprite.y)
            }
          } else if (sprite !== false) {
            console.error(child)
            throw new Error(`illegal getsprite return!!`)
          }
        }

        if (debugEnabled && !(child instanceof Layer)) this.drawHitbox(...child.frame, 'green')

        child.changed = false
      })

      if (!this.buffer) {
        return false
      } else {
        return this.sprite
      }
    })
  }
}

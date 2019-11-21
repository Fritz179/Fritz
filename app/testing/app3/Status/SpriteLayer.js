class SpriteLayer extends Layer {
  constructor(...args) {
    super(...args)

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
        const sprite = child.getSprite(this)
        if (sprite) {
          this.image(sprite, child.x + sprite.x, child.y + sprite.y)
        } else if (sprite !== false) {
          console.error(child)
          throw new Error(`illegal getsprite return!!`)
        }
        if (debugEnabled) this.drawHitbox(...child.frame, 'green')

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

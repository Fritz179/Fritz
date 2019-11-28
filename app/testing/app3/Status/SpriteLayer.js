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

    // fixedUpdate
    this.fixedUpdate.addPre(() => {
      for (var i = 0; i < this.children.types.length; i++) {
        const type = this.children.types[i]
        if (!this.children[type] || !this.children[type].length) break

        if (collisionTable[type]) {
          for (let i = 0; i < collisionTable[type].length; i++) {
            const to = collisionTable[type][i]
            if (!this.children[to] || !this.children[to].length) break

            this.children[to].forEach(target => {
              this.children[type].forEach(collider => {
                if (rectIsOnRect(target, collider)) {

                  collider.onEntityCollision({name: to, entity: target})
                }
              })
            })
          }
        }
      }
    })

    // getSprite
    this.getSprite.addPost((ctx, ret) => {
      if (ret === false) return false

      // begin bubble process
      this.children.forEach(child => {
        if (!child.hardChanged && child.buffer && !debugEnabled) {
          this.image(child, child.sprite.x, child.sprite.y)
        } else {
          const sprite = child.getSprite(this)

          if (sprite) {
            if (child instanceof Layer) {
              this.image(sprite, child.sprite.x, child.sprite.y)
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

let collisionTable = {}
function addCollision(of, to) {
  if (!Array.isArray(to)) {
    to = [to]
  }

  of = of.name
  to.map(entity => entity.name).forEach(entity => {
    if (!collisionTable[of]) {
      collisionTable[of] = []
    }

    if ((collisionTable[entity] && collisionTable[entity].includes(of)) || collisionTable[of].includes(entity)) {
      console.error(`${entity} already collding with ${of}`)
    } else {
      collisionTable[of].push(entity)
    }
  })
}

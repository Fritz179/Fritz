class SpriteLayer extends Layer {
  constructor(...args) {
    super(...args)
  }

  fixedUpdateCapture() {
    for (let i = 0; i < this.children.types.length; i++) {
      const type = this.children.types[i]
      if (!this.children[type] || !this.children[type].length) continue

      if (collisionTable[type]) {
        for (let i = 0; i < collisionTable[type].length; i++) {
          const to = collisionTable[type][i]

          if (!this.children[to] || !this.children[to].length) break
          const e1 = this.children[type]
          const e2 = this.children[to]


          if (type == to) {

            for (let i1 = e1.length - 1; i1 >= 0; i1--) {
              const target = e1[i1]

              for (let i2 = i1 - 1; i2 >= 0; i2--) {

                const collider = e2[i2]
                if (!(target.xv || target.yv || collider.xv || collider.yv)) break
                // console.log(i1, i2, type, to);

                if (target !== collider) {
                  if (rectIsOnRect(target.triggerBox, collider.triggerBox)) {

                    collider.onEntityCollision({name: to, entity: target})
                  }
                }
              }
            }
          } else {
            this.children[to].forEach(target => {
              this.children[type].forEach(collider => {
                if (rectIsOnRect(target.triggerBox, collider.triggerBox)) {
                  collider.onEntityCollision({name: to, entity: target})
                }
                // if (target !== collider && (target.xv || target.yv || collider.xv || collider.yv)) {
                // }
              })
            })
          }
        }
      }
    }
  }

  updateBubble(args, ret = false) {
    this.changed = this.changed || ret

    this.children.forEach(child => {
      const updated = child.update(this)

      if (updated || child.changed || redrawAll) {
        this.changed = true
      }
    })

    return this.changed
  }

  getSpriteBubble(ctx, ret) {
    if (ret === false) return false

    // begin bubble process
    this.children.forEach(child => {
      if (!child.changed && child.buffer && !redrawAll) {
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

      if (debugEnabled) {
        if (child instanceof Layer) {
          child.drawHitbox(child.sprite.x, child.sprite.y, child.w, child.h, 'green', 3)
          child.drawHitbox(child.sprite.x, child.sprite.y, child.w, child.h, 'orange', 1)
        } else {
          this.drawHitbox(...child.frame, 'green', 3)
          this.drawHitbox(...child.triggerBox.frame, 'orange', 1)
        }
      }

      child.changed = false
    })

    if (!this.buffer) {
      return false
    } else {
      return this.sprite
    }
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

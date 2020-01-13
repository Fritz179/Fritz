class CraftingSlot extends ItemHolder {
  constructor(id, quantity, x, isResult) {
    super(sprites.slot.slot[0])

    this.id = id
    this.quantity = quantity
    this.isResult = isResult
    this.clicked = false

    this.setPos(x * 80 + 16, 0)
    this.setSize(64, 64)
  }

  onLeftClick({stopPropagation}) {
    stopPropagation()
  }

  onClickUp() {
    this.clicked = true
  }

  fixedUpdate() {
    if (this.clicked) {
      this.clicked = false
      this.isResult.craft()
    }
  }

  getSprite() {
    if (this.changed) {
      this.oldId = this.id
      this.oldQuantity = this.quantity
      this.oldSelected = this.selected

      this.textFont('consolas')
      this.textAlign('right', 'bottom')

      this.textSize(32)
      this.image(tiles[this.id].sprite, this.x + 16, this.y + 16, 32, 32)

      if (tiles[this.id].maxStack > 1) {
        this.text(this.quantity, this.x + 54, this.y + 64)
      }
    }

    return this.sprite
  }
}


class CraftingLayer extends SpriteLayer {
  constructor(ingredients , result, y) {
    super()

    this.ingredients  = ingredients
    this.result = result
    this.y = -y * 80 + 16

    let offset = 0

    ingredients.forEach(({name, quantity}) => {
      this.addChild(new CraftingSlot(tileNames[name].id, quantity, offset++, false))
    })

    // space for arrow
    offset++

    result.forEach(({name, quantity}) => {
      this.addChild(new CraftingSlot(tileNames[name].id, quantity, offset++, this))
    })
  }

  craft() {
    this.ingredients.forEach(({name, quantity}) => {
      main.player.inventory.remove(tileNames[name].id, quantity)
    })

    this.result.forEach(({name, quantity}) => {
      main.player.inventory.add(tileNames[name].id, quantity)
    })
  }

  getSprite() {

    const ing = this.ingredients.length
    const res = this.result.length

    for (let i = 0; i < ing; i++) {
      if (i == 0) {
        this.image(sprites.slot.start[0], 8 + i * 80 + 0, -8, 20, 80)
      } else {
        this.image(sprites.slot.junction[1], 8 + i * 80 + 0, -8, 20, 80)
      }

      this.image(sprites.slot.middle[0], 8 + i * 80 + 20, -8, 40, 80)
      this.image(sprites.slot.junction[0], 8 + i * 80 + 60, -8, 20, 80)
    }

    // arrow
    this.image(sprites.slot.arrow[0], 8 + ing * 80, -8, 80, 80)


    for (let i = 0; i < res; i++) {
      this.image(sprites.slot.junction[1], 8 + (i + ing + 1) * 80 + 0, -8, 20, 80)
      this.image(sprites.slot.middle[0], 8 + (i + ing + 1) * 80 + 20, -8, 40, 80)

      if (i == res - 1) {
        this.image(sprites.slot.start[1], 8 + (i + ing + 1) * 80 + 60, -8, 20, 80)
      } else {
        this.image(sprites.slot.junction[0], 8 + (i + ing + 1) * 80 + 60, -8, 20, 80)
      }
    }
  }
}

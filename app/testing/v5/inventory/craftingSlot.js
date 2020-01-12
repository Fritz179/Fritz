class CraftingSlot extends ItemHolder {
  constructor(id, quantity, x, isResult) {
    super(sprites.slot.slot[0])

    this.id = id
    this.quantity = quantity
    this.isResult = isResult

    this.setPos(x * 80 + 16, 0)
    this.setSize(64, 64)
  }

  onLeftClick({stopPropagation$}) {
    stopPropagation()
  }

  onClickUp() {
    if (this.isResult) {
      console.log('crafted!');
    }
  }

  getSprite() {
    if (this.changed) {
      this.oldId = this.id
      this.oldQuantity = this.quantity
      this.oldSelected = this.selected


      this.image(sprites.slot.slot[0], this.x, this.y, 64, 64)

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

    this.ingredients  = ingredients.length
    this.result = result.length
    this.y = -y * 80 + 16

    let offset = 0

    ingredients.forEach(({name, quantity}) => {
      this.addChild(new CraftingSlot(tileNames[name].id, quantity, offset++, false))
    })

    // space for arrow
    offset++

    result.forEach(({name, quantity}) => {
      this.addChild(new CraftingSlot(tileNames[name].id, quantity, offset++, true))
    })
  }

  getSprite() {

    for (let i = 0; i < this.ingredients ; i++) {
      let pos = i == 0 ? (this.ingredients == 1 ? 4 : 0) : i < this.ingredients  - 1 ? 1 : 2
      this.image(sprites.slot.crafting[pos][0], 8 + i * 80, -8, 80, 80)
    }

    // arrow
    let j = this.ingredients
    this.image(sprites.slot.crafting[3][0], 8 + j * 80, -8, 80, 80)

    for (let i = 0; i < this.result; i++) {
      let pos = i == 0 ? (this.result == 1 ? 4 : 2) : i < this.result - 1 ? 1 : 0

      this.image(sprites.slot.crafting[pos][1], 8 + (i + j + 1) * 80, -8, 80, 80)
    }
  }
}

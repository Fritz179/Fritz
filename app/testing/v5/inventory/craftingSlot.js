class CraftingLayer extends SpriteLayer {
  constructor(ingredients, result, y) {
    super()

    this.setCameraMode({align: 'left-top'})
    this.ingredients = ingredients
    this.result = result
    this.y = -y * 80 + 16
    this.x = -8
    this.clicked = false

    this.setSize((ingredients.length + result.length + 1) * 80, 80)
  }

  onClick() {
    this.clicked = true
  }

  onClickUp() {
    if (this.clicked) {
      this.clicked = false
      
      this.ingredients.forEach(({name, quantity}) => {
        main.player.inventory.remove(tileNames[name].id, quantity)
      })

      this.result.forEach(({name, quantity}) => {
        main.player.inventory.add(tileNames[name].id, quantity)
      })
    }
  }

  getSprite() {

    const ing = this.ingredients.length
    const res = this.result.length

    for (let i = 0; i < ing; i++) {
      const x = i * 80

      if (i == 0) {
        this.image(sprites.slot.start[0], x + 0, 0, 20, 80)
      } else {
        this.image(sprites.slot.junction[1], x + 0, 0, 20, 80)
      }

      this.image(sprites.slot.middle[0], x + 20, 0, 40, 80)
      this.image(sprites.slot.junction[0], x + 60, 0, 20, 80)

      const {name, quantity} = this.ingredients[i]
      this.textFont('consolas')
      this.textAlign('right', 'bottom')

      this.textSize(32)
      this.image(tileNames[name].sprite, x + 24, 24, 32, 32)

      if (tileNames[name].maxStack > 1) {
        this.text(quantity, x + 62, 72)
      }
    }

    // arrow
    this.image(sprites.slot.arrow[0], ing * 80, 0, 80, 80)


    for (let i = 0; i < res; i++) {
      const x = (i + ing + 1) * 80

      this.image(sprites.slot.junction[1], x + 0, 0, 20, 80)
      this.image(sprites.slot.middle[0], x + 20, 0, 40, 80)

      if (i == res - 1) {
        this.image(sprites.slot.start[1], x + 60, 0, 20, 80)
      } else {
        this.image(sprites.slot.junction[0], x + 60, 0, 20, 80)
      }

      const {name, quantity} = this.result[i]
      this.textFont('consolas')
      this.textAlign('right', 'bottom')

      this.textSize(32)
      this.image(tileNames[name].sprite, x + 24, 24, 32, 32)

      if (tileNames[name].maxStack > 1) {
        this.text(quantity, x + 62, 72)
      }
    }
  }
}

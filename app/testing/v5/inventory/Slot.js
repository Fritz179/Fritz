class Slot extends ItemHolder {
  constructor(inventory, num) {
    super(sprites.slot[0])

    const x = num % inventory.cols
    const y = (num - x) / inventory.cols

    this.setPos(x * 80 + 16, y * 80 + 16)
    this.setSize(64, 64)

    this.inventory = inventory
    this.num = num

    this.oldSelected = false
    this.mousePos = {x: 0, y: 0}
    this.leftTime = 0
  }

  get changed() { return this.id != this.oldId || this.quantity != this.oldQuantity || this.selected != this.oldSelected }
  set changed(bool) { }

  get selected() { return this.inventory.selected == this.num }

  onLeftClick({stopPropagation, x, y}) {
    if (hand.isEmpty && !this.isEmpty) {
      this.dump(hand)

      hand.from = this
      this.leftTime = 0
    }

    stopPropagation()
  }

  onClickUp() {
    if (this.isEmpty && !hand.isEmpty && (this != hand.from || this.leftTime > 10)) {
      this.getFrom(hand)
    } else if (hand.id == this.id) {
      const space = 64 - this.quantity

      if (hand.quantity > space) {
        this.quantity += space
        hand.quantity -= space
      } else {
        this.quantity += hand.quantity
        hand.empty()
      }
    }
  }

  update() {
    this.leftTime++
  }

  getSprite() {
    if (this.changed) {
      this.oldId = this.id
      this.oldQuantity = this.quantity
      this.oldSelected = this.selected

      this.image(sprites.slot[this.selected ? 1 : 0], this.x, this.y, 64, 64)

      this.textFont('consolas')
      this.textAlign('right', 'bottom')

      if (this.id) {
        this.textSize(32)
        this.image(sprites.tiles[this.id], this.x + 16, this.y + 16, 32, 32)
        this.text(this.quantity, this.x + 54, this.y + 64)
      }

      if (this.num < this.inventory.cols) {
        this.textSize(16)
        this.text(this.num + 1, this.x + 57, this.y + 22)
      }
    }

    return this.sprite
  }
}
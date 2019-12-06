class Hand extends ItemHolder {
  constructor(pointer) {
    super()

    this.pointer = pointer

    this.mouse = {x: 0, y:0}
    this.mouseMoved = false
    this.placing = false

    this.from = null
  }

  get changed() { return this.id != this.oldId || this.quantity != this.oldQuantity || this.mouseMoved }
  set changed(bool) { }

  fixedUpdate() {
    const {pointer} = this

    if (this.placing && !pointer.tile && !pointer.overEntity) {
      const {selected, selectedSlot} = player.inventory

      if (this.id) {
        pointer.tile = this.id
        this.removeOne()
      } else if (selectedSlot.id) {
        pointer.tile = selectedSlot.id
        player.inventory.getFromSlot(selected, 1)
      }
    }
  }

  onRightMouseBubble() {
    this.placing = true
  }

  onRightMouseUp() {
    this.placing = false
  }

  onLeftMouseBubble() {
    if (this.id) {
      const {id, quantity} = this

      this.empty()
      player.inventory.add(id, quantity)
    }
  }

  onDrag({x, y}) {
    this.mouse = {x, y}
    this.mouseMoved = true
  }

  getSprite(ctx) {
    this.oldId = this.id
    this.oldQuantity = this.quantity
    this.mouseMoved = false

    const {x, y} = this.mouse

    if (this.id) {
      ctx.textFont('consolas')
      ctx.textAlign('right', 'bottom')
      ctx.textSize(32)
      ctx.image(sprites.tiles[this.id], x - 16, y - 16, 32, 32)
      ctx.text(this.quantity, x + 37, y + 32)
    }

    return false
  }
}

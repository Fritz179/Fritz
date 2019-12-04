class Inventory extends SpriteLayer {
  constructor() {
    super()

    this.setCameraMode({align: 'left-top', overflow: 'display'})

    this.cols = 9
    this.rows = 4
    this.slots = []
    this.open = true
    this.hand = -1

    for (let i = 0; i < this.cols * this.rows; i++) {
      this.slots[i] = this.addChild(new Slot(this, i))
    }

    this.selected = 0

    this.getSprite.addPost(() => {
      if (this.hand != -1) {
        console.log(this.hand);
        const {x, y, mousePos, id, quantity} = this.handSlot

        this.textFont('consolas')
        this.textAlign('right', 'bottom')
        this.textSize(32)

        this.image(sprites.tiles[id], x + mousePos.x - 16, y + mousePos.y - 16, 32, 32)
        this.text(quantity, x + mousePos.x + 22, y + mousePos.y + 32)
      }
    })
  }

  get selectedSlot() { return this.slots[this.selected] }
  get handSlot() { return this.slots[this.hand] }

  onKey({name}) {
    switch (name) {
      case 'e': this.toggleInventory(); this.changed = HARD; break;
    }

    let int = parseInt(name)
    if (int && int <= this.cols) {
      this.selected = int - 1
    }
  }

  slotClicked(num) {
    console.log(num);
  }

  toggleInventory() {
    this.open = !this.open

    if (this.open) {
      this.setChildren(this.slots)
    } else {
      this.setChildren(this.slots.slice(0, this.cols))
    }
  }

  onMouseUpBubble() {
    this.hand = -1
  }

  onWheel({dir}) {
    this.selected += dir

    if (this.selected < 0) this.selected = this.cols - 1
    if (this.selected > this.cols - 1) this.selected = 0
  }

  add(id, quantity = 1) {

    // check all existing slots
    for (let i = 0; i < this.slots.length; i++) {
      const slot = this.slots[i]

      if (slot.id == id && slot.quantity < 64) {
        const space = 64 - slot.quantity

        if (quantity > space) {
          slot.quantity += space
          quantity -= space
        } else {
          slot.quantity += quantity
          return 0
        }
      }
    }

    // check for empty space
    for (let i = 0; i < this.slots.length; i++) {
      const slot = this.slots[i]

      if (slot.id == 0) {
        slot.id = id

        if (quantity > 64) {
          slot.quantity = 64
          quantity -= 64
        } else {
          slot.quantity = quantity
          return 0
        }
      }
    }

    return quantity
  }

  getFromSlot(slotNum, quantity = 1) {
    const slot = this.slots[slotNum]

    if (slot.quantity >= quantity) {
      slot.quantity -= quantity

      if (!slot.quantity) {
        for (var i = 0; i < this.slots.length; i++) {
          const candidate = this.slots[i]

          if (candidate == slot) {
            continue
          }

          if (candidate.id == slot.id) {
            slot.quantity = candidate.quantity
            candidate.quantity = 0
            candidate.id = 0

            break
          }
        }

        if (!slot.quantity) {
          slot.id = 0
        }
      }

      return quantity
    } else {
      console.error(`Cannot remove from empty slot!!`);
      return 0
    }
  }

  remove(id, count = 1) {

  }

  has(id) {

  }
}

class Slot extends Canvas {
  constructor(inventory, num) {
    super(sprites.slot[0])

    const x = num % inventory.cols
    const y = (num - x) / inventory.cols

    this.setPos(x * 80 + 16, y * 80 + 16)
    this.setSize(64, 64)

    this.inventory = inventory
    this.num = num

    this.id = 0
    this.oldId = null
    this.quantity = 0
    this.oldQuantity = null
    this.oldSelected = false
    this.oldInHand = false
    this.mousePos = {x: 0, y: 0}
  }

  get changed() {
    return this.id != this.oldId || this.quantity != this.oldQuantity || this.selected != this.oldSelected || this.inHand != this.oldInHand || this.inHand
  }

  get softChanged() { return this.changed }
  get hardChanged() { return this.changed }
  get selected() { return this.inventory.selected == this.num }
  get inHand() { return this.inventory.hand == this.num }
  set changed(bool) { }

  onLeftClick({stopPropagation, x, y}) {
    if (this.id) {
      this.mousePos = {x, y}
      this.inventory.hand = this.num
    }

    stopPropagation()
  }

  onClickDrag({x, y}) {
    this.mousePos = {x, y}
  }

  onClickUp() {
    if (this.inventory.hand != -1 && !this.id) {
      const slot = this.inventory.handSlot
      this.id = slot.id
      this.quantity = slot.quantity
      slot.id = 0
      slot.quantity = 0

      this.inventory.hand = -1
    }
  }

  getSprite() {
    if (this.changed) {
      this.oldId = this.id
      this.oldQuantity = this.quantity
      this.oldSelected = this.selected
      this.oldInHand = this.inHand

      this.image(sprites.slot[this.selected ? 1 : 0], this.x, this.y, 64, 64)

      this.textFont('consolas')
      this.textAlign('right', 'bottom')

      if (this.id && !this.inHand) {
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

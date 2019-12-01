class Inventory extends SpriteLayer {
  constructor() {
    super()

    this.setCameraMode({align: 'left-top', overflow: 'display'})

    this.cols = 9
    this.rows = 4
    this.slots = []
    this.open = true
    this.hand = this.addChild(new Slot(this, null))

    for (let i = 0; i < this.cols * this.rows; i++) {
      this.slots[i] = this.addChild(new Slot(this, i))
    }

    this.selected = 0
  }

  get selectedSlot() { return this.slots[this.selected] }

  onKey({name}) {
    switch (name) {
      case 'e': this.open = !this.open; this.changed = HARD; break;
    }

    let int = parseInt(name)
    if (int && int <= this.cols) {
      this.selected = int - 1
    }
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
  }

  get changed() { return this.id != this.oldId || this.quantity != this.oldQuantity || this.selected != this.oldSelected}
  get softChanged() { return this.changed }
  get hardChanged() { return this.changed }
  get selected() { return this.inventory.selected == this.num }
  set changed(bool) { }

  onClick({stopPropagation}) {
    stopPropagation()
    console.log(this.num);
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

    return this.inventory.open || this.num < this.inventory.cols ? this.sprite : false
  }
}

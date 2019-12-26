class Inventory extends SpriteLayer {
  constructor() {
    super()

    this.setCameraMode({align: 'left-top', overflow: 'display'})

    this.cols = 9
    this.rows = 4
    this.slots = []

    for (let i = 0; i < this.cols * this.rows; i++) {
      this.slots[i] = this.addChild(new Slot(this, i))
    }

    this.open = true
    this.toggleInventory()

    this.selected = 0
  }

  get selectedSlot() { return this.slots[this.selected] }

  onKey({name}) {
    switch (name) {
      case 'e': this.toggleInventory(); break;
    }

    let int = parseInt(name)
    if (int && int <= this.cols) {
      this.setSelected(int - 1)
    }
  }

  setSelected(num) {
    this.selected = num
    main.pointer.changed = true
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

    this.changed = true
  }

  onWheel({dir}) {
    let newSel = this.selected + dir

    if (newSel < 0) newSel = this.cols - 1
    if (newSel > this.cols - 1) newSel = 0

    this.setSelected(newSel)
  }

  add(_id, quantity = 1) {
    const {maxStack, id} = typeof _id == 'string' ? tileNames[_id] : tiles[_id]
    const {hand} = main

    if (hand.id == id && quantity < maxStack) {
      const space = maxStack - hand.quantity

      if (quantity > space) {
        hand.quantity += space
        quantity -= space
      } else {
        hand.quantity += quantity
        return 0
      }
    }

    // check all existing slots
    for (let i = 0; i < this.slots.length; i++) {
      const slot = this.slots[i]

      if (slot.id == id && slot.quantity < maxStack) {
        const space = maxStack - slot.quantity

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

        if (quantity > maxStack) {
          slot.quantity = maxStack
          quantity -= maxStack
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

// main.addChild(new Drop(x + this.w / 2, y + this.h / 2, tileNames[tiles[tile].drop].id))

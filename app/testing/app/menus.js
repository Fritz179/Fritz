class Menu {
  constructor() {
    this.pointing = -1
    this.status = null
    this.buttons = []
    this.buttonConstructor = Animation
  }

  // _update() {
  //   if (typeof this.update == 'function') this.update()
  //   else {
  //     if (this.defaultButtons) {
  //       const x = round((mouseX - canvas.xOff) / camera.multiplierX), y = round((mouseY - canvas.yOff) / camera.multiplierY)
  //       for (let name in this.buttons) {
  //         if (p5.prototype.collidePointRect({x: x, y: y}, this.buttons[name])) {
  //           this.pointing = this.buttonsName.indexOf(name)
  //         }
  //       }
  //
  //       if (this.pointing != -1) {
  //         const {x1, y1, x2, y2} = this.buttons[this.buttonsName[this.pointing]]
  //         const w = this.sprite.pointer.width, h = this.sprite.pointer.height
  //         const x3 = (x1 - w * 2)
  //         const y3 = (y1 + (y2 - y1) / 2 - h / 2)
  //         const x4 = (x2 + w)
  //         canvas.image(this.sprite.pointer, x3, y3, w, h)
  //         canvas.image(this.sprite.pointer, x4, y3, w, h)
  //       }
  //     }
  //   }
  // }

  _onclick() {
    const {multiplierX, multiplierY, canvas} = this.status.camera
    const x = round((mouseX - canvas.xOff) / multiplierX), y = round((mouseY - canvas.yOff) / multiplierY)
    this.buttons.forEach(button => {
      if (p5.prototype.collidePointRect({x: x, y: y}, button)) {
        if (typeof button.onClick == 'function') button.onClick()
        else this.buttonClicked(button.name)
      }
    })

    if (typeof this.onclick == 'function') this.onclick(x, y)
  }

  buttonClicked(status) {
    if (statuses[status]) setCurrentStatus(status)
    else throw new Error(`Unhandled button press: ${status}`)
  }

  pre() { }
  post() { }

  // _onInput(input) {
  //   if (typeof this.onInput == 'function') this.onInput(input)
  //
  //   if (this.defaultButtons) {
  //     let updatePointer = () => {
  //       if (this.pointing >= this.buttonsName.length) this.pointing = 0
  //       else if (this.pointing < 0) this.pointing = this.buttonsName.length - 1
  //     }
  //
  //     switch (input) {
  //       case 'up': this.pointing--; updatePointer(); break;
  //       case 'down': this.pointing++; updatePointer(); break;
  //       case 'Enter': if (this.pointing != -1) this._buttonPressed(this.buttonsName[this.pointing]); break;
  //     }
  //   }
  // }

  _addButton(name, pos) {
    if (typeof this.addButton == 'function') this.addButton(name, pos)
    else {
      const btn = new this.buttonConstructor()
      btn.name = name
      btn.setCord(pos)
      this.buttons.push(this.buttons[name] = btn)
    }
  }

  _getSprite(canvas) {
    if (this.sprite.main) canvas.image(this.sprite.main, 0, 0)
    else canvas.background(255, 0, 0)

    if (typeof this.getSprite == 'function') return this.getSprite(canvas)

    this.buttons.forEach(button => {
      canvas.image(button.getSprite(), button.x1, button.y1)
    })

    return canvas
  }
}

class pointerMenu extends Menu {
  constructor() {
    super()
  }

  onclick() {

  }

  getSprite() {

  }
}

p5.prototype.Menu = Menu
p5.prototype.pointerMenu = pointerMenu

function createDefaultMenuPointer() {
  return createDefaultTexture()
}

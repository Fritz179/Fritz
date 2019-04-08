class Menu extends Status {
  constructor() {
    super()
    this.camera.settings({cameraWidth: 1920, ratio: 16 / 9, cameraOverflow: 'hidden'})
    if (this.sprite.main) this.camera.addBackgroundLayer(this.sprite.main)

    this.pointing = -1
    this.status = null
    this.buttons = new Set()

    this.addPreFunction(() => this.buttons.forEach(button => button.listen('onClick')))
    this.addPreFunction(() => this.listen('onKey'))

    if (this.sprite) {
      const {buttons} = this.sprite.json
      for (key in buttons) {
        this._addButton(key, buttons[key])
      }
    }
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

  buttonClicked(status) {
    console.log(status);
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
    //if no custom addButton function, add it the default way
    if (typeof this.addButton == 'function') this.addButton(name, pos)
    else this.insertButton(new Button(() => this.buttonClicked(name)).setCord(pos))
  }

  insertButton(button) {
    //add spriteLayer to see button, if it was alredy added, the camera won't add anotherone
    this.camera.addSpriteLayer()

    this.ecs.animations.add(button)
    this.buttons.add(button)
  }
}

class Button extends Entity {
  constructor(_onClick) {
    super()
    this._onClick = _onClick
  }

  onClick() {
    //if _onClick is a function, call it, else if it is a string and the status exist, set it as the currentStatus
    if (typeof this._onClick == 'function') this._onClick()
    else if (typeof this._onClick == 'string' && statuses[this._onClick]) setCurrentStatus(this._onClick)
  }

  getSprite() {
    return false
  }
}

p5.prototype.Menu = Menu
p5.prototype.Button = Button

function createDefaultMenuPointer() {
  return createDefaultTexture()
}

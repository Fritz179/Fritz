p5.prototype.menuSprites = {}
p5.prototype.createMenu = (statusName, options = {}, Constructor) => {
  addDefaultOptions(options, {path: './img', json: false, cameraMode: 'auto', cameraOverflow: 'hidden'})
  if (!Constructor) Constructor = Menu
  if (!statusName) statusName = Constructor.name
  if (statusName == 'Menu') throw new Error(`Invalid Menu name: ${Constructor}`)

  const ret = {}
  loadJSON(options.jsonPath || `.${options.path}/${statusName}.json`,json => {
    if (!json.buttons) throw new Error(`no buttons for menu: ${statusName}`)
    addDefaultOptions(json, {sprites: [], options: {}})

    const sprite = menuSprites[statusName] = {}

    if (json.defaultPointer) sprite.pointer = createDefaultMenuPointer()

    loadSpriteSheet(statusName, options, img => sprite.sprite = img)

    for (key in json.sprites) {
      loadSpriteSheet(key, json.sprites[key] || {}, img => sprite[key] = img)
    }

    const menu = new Constructor()
    menu.buttons = json.buttons
    let buttonsName = []
    for (let i in json.buttons) buttonsName.push(i)
    menu.buttonsName = buttonsName
    menu.statusName = statusName
    menu.sprite = sprite

    p5.prototype.onStatusChange(statusName, menu.pre, 'pre')
    p5.prototype.onStatusChange(statusName, menu.post, 'post')

    listenInput(menu, statusName)
    statusNamespaces[statusName] = {
      updateFunctions: [menu._update.bind(menu)],
      settings: addDefaultOptions({cameraMode: options.cameraMode, cameraOverflow: options.cameraOverflow}, getCameraRatio(options)),
      type: 'menu'
    }
  }, (e) => {
    //if image failed to load, throw an error
    console.log(e);
    throw new Error(`Error loading json for menu at: ${e.path[0].src}`);
  })

  return ret
}
p5.prototype.registerPreloadMethod('createMenu', p5.prototype.createMenu);

class Menu {
  constructor() {
    this.pointing = -1
  }

  _update() {
    if (typeof this.update == 'function') this.update()
    else {
      background(0)
      canvas.image(this.sprite.sprite, 0, 0, canvas.width, canvas.height)

      const x = round((mouseX - canvas.xOff) / camera.multiplierX), y = round((mouseY - canvas.yOff) / camera.multiplierY)
      for (let name in this.buttons) {
        if (p5.prototype.collidePointRect({x: x, y: y}, this.buttons[name])) {
          this.pointing = this.buttonsName.indexOf(name)
        }
      }

      if (this.pointing != -1) {
        const {x1, y1, x2, y2} = this.buttons[this.buttonsName[this.pointing]]
        const w = this.sprite.pointer.width, h = this.sprite.pointer.height
        const x3 = (x1 - w * 2)
        const y3 = (y1 + (y2 - y1) / 2 - h / 2)
        const x4 = (x2 + w)
        canvas.image(this.sprite.pointer, x3, y3, w, h)
        canvas.image(this.sprite.pointer, x4, y3, w, h)
      }
    }
    drawCanvas()
  }

  _onclick() {
    const x = round((mouseX - canvas.xOff) / camera.multiplierX), y = round((mouseY - canvas.yOff) / camera.multiplierY)

    if (typeof this.onclick == 'function') this.onclick(x, y)
    else {
      for (let name in this.buttons) {
        if (p5.prototype.collidePointRect({x: x, y: y}, this.buttons[name])) {
          this._buttonPressed(name)
        }
      }
    }
  }

  _buttonPressed(status) {
    if (typeof this.buttonPressed == 'function') this.buttonPressed()
    else if (statusNamespaces[status]) changeStatus(status)
    else throw new Error(`Unhandled button press: ${status}`)
  }

  pre() { }
  post() { }

  onInput(input) {
    switch (input) {
      case 'up': this.pointing--; break;
      case 'down': this.pointing++; break;
      case 'Enter': if (this.pointing != -1) this._buttonPressed(this.buttonsName[this.pointing]); break;
    }
    if (this.pointing >= this.buttonsName.length) this.pointing = 0
    else if (this.pointing < 0) this.pointing = this.buttonsName.length - 1
  }
}

class MainMenu extends Menu {
  constructor() {
    super()
  }

  onclick() {

  }

  getSprite() {

  }
}

p5.prototype.Menu = Menu

function createDefaultMenuPointer() {
  return createDefaultTexture()
}

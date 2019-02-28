p5.prototype.menuSprites = {}
p5.prototype.createMenu = (Constructor, statusName, options = {}) => {
  addDefaultOptions(options, {path: './img', json: false})
  if (!statusName) statusName = Constructor.name
  if (statusName == 'Menu') throw new Error(`Invalid Menu name: ${Constructor}`)

  const ret = {}

  loadJSON(options.jsonPath || `.${options.path}/${statusName}.json`,json => {
    if (!json.buttons) throw new Error(`no buttons for menu: ${statusName}`)
    addDefaultOptions(json, {sprites: [], options: {}})

    menuSprites[statusName] = {pointer: createDefaultMenuPointer()}
    loadSpriteSheet(statusName, options, img => menuSprites[statusName].sprite = img)

    for (key in json.sprites) {
      loadSpriteSheet(key, json.sprites[key].options || {}, img => menuSprites[statusName][key] = img)
    }

    const menu = Constructor ? new Constructor() : new Menu()
    menu.buttons = json.buttons
    menu.statusName = statusName
    menu.sprite = menuSprites[statusName]

    p5.prototype.changeStatus(statusName, menu.pre, 'pre')
    p5.prototype.changeStatus(statusName, menu.post, 'post')

    listenInput(menu, statusName)
    statusFunctions[statusName] = [menu._update.bind(menu)]
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

  }

  _update() {
    this.update()
    image(this.sprite.sprite, 0, 0, width, height)
  }

  update() {

  }

  onclick() {

  }

  getSprite() {

  }

  pre() { }
  post() { }

  onInput(input) {
    console.log(input);
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

const onStatusChangeCallbacks = {}

p5.prototype.onStatusChange = (status, callback, type = 'pre') => {
  if (!onStatusChangeCallbacks[status]) onStatusChangeCallbacks[status] = {pre: [], post: []}
  onStatusChangeCallbacks[status][type].push(callback)
}

p5.prototype.changeStatus = newStatus => {
  if (onStatusChangeCallbacks[status]) onStatusChangeCallbacks[status].pre.forEach(fun => fun())
  status = newStatus
  if (onStatusChangeCallbacks[status]) onStatusChangeCallbacks[status].pre.forEach(fun => fun())
}

p5.prototype.Menu = Menu

function createDefaultMenuPointer() {
  return createDefaultTexture()
}

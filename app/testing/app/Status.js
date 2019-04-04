class Status extends Master {
  constructor(statusName) {
    super()
    this.statusName = statusName
    this.preFunctions = []
    this.postFunctions = []
    this.updateFunctions = []
    this.fixedUpdateFunctions = []
    this.pre = () => { }
    this.post = () => { }
    this.update = () => { }

    this.camera = new Camera()
    this.ecs = new ECS()
  }

  addPreFunction(fun) { this.preFunctions.push(fun) }
  addPostFunction(fun) { this.postFunctions.push(fun) }
  addUpdateFunction(fun) { this.updateFunctions.push(fun) }
  addFixedUpdateFunction(fun) { this.fixedUpdateFunctions.push(fun) }

  _pre(...args) { this.preFunctions.forEach(fun => fun(...args)); this.pre(...args) }
  _post(...args) { this.postFunctions.forEach(fun => fun(...args)); this.post(...args) }
  _update() { this.updateFunctions.forEach(fun => fun()); this.ecs.update(); this.camera.update() }
  _getSprite() { }
  _fixedUpdate() { this.fixedUpdateFunctions.forEach(fun => fun()); this.ecs.fixedUpdate() }

  createMenu(Constructor, name, options = {}) {
    //if the only parameter is a string, create default menu
    if (typeof Constructor == 'string') return this.createMenu(Menu, Constructor)
    if (!name) name = Constructor.name.toLowerCase()
    const {statusName} = this

    addDefaultOptions(options, {json: true, path: '/img/menus', mainImage: {}, cameraMode: 'auto', cameraOverflow: 'hidden'})

    //create menu
    const menu = new Constructor()
    menu.status = status
    menu.sprite = p5.prototype.menuSprites[statusName]



    if (options.json) {
      //get json and parse it
      loadJSON(options.jsonPath || `.${options.path}/${name}.json`, json => {
        addDefaultOptions(json, {sprites: [], buttons: [], options: {}})

        //add sprites
        for (key in json.sprites) {
          addDefaultOptions(json.sprites[key], {path: './img/menus'})
          loadSpriteSheet(key, json.sprites[key], img => sprite[key] = img)
        }

        //add buttons
        for (let key in json.buttons) {
          menu._addButton(key, json.buttons[key])
        }

        //listen to inputs
        menu.listenInputs('click')

        //add camera and addForegroundLayer
        this.addCamera({cameraMode: 'auto', cameraOverflow: 'hidden', ratio: 16 / 9, cameraWidth: 1920})
        this.camera.addForegroundLayer(menu._getSprite.bind(menu))

      }, e => {
        console.log(e);
        throw new Error(`Error json loading: ${name} at: `)
      })
    } else {
      console.error('// TODO: menu w/o json?');
    }
  }
}
/*
  createMenu(String)
  createMenu(Constructor)
  createMenu(Constructor, String)
*/

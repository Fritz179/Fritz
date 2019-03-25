p5.prototype.menuSprites = {}

class Status {
  constructor(statusName) {
    this.statusName = statusName
    this.preFunctions = []
    this.postFunctions = []
    this.updateFunctions = []
    this.pre = () => { }
    this.post = () => { }
    this.update = () => { }
    this.cameraEnabled = this.mapsEnabled = this.ECSEnabled = false
  }

  addPreFunction(fun) { this.preFunctions.push(fun) }
  addPostFunction(fun) { this.postFunctions.push(fun) }
  addUpdateFunction(fun) { this.updateFunctions.push(fun) }

  _update() { this.updateFunctions.forEach(fun => fun()); if (this.cameraEnabled) this.camera.update() }
  _pre(...args) { this.preFunctions.forEach(fun => fun(...args)); this.pre(...args) }
  _post(...args) { this.postFunctions.forEach(fun => fun(...args)); this.post(...args) }

  addCamera(settings) {
    if (this.cameraEnabled) throw new Error('camera already enabled')
    this.cameraEnabled = true
    this.camera = new Camera(settings)
  }

  addMaps(settings) {
    if (this.mapsEnabled) throw new Error('maps already enabled')
    this.mapsEnabled = true
    this.maps = new Maps(settings)
  }

  addECS(settings) {
    if (this.ECSEnabled) throw new Error('ECS already enabled')
    this.ECSEnabled = true
    this.ecs = new ECS(settings)
    this.addUpdateFunction(() => {
      this.ecs.update()
      this.ecs.fixedUpdate()
    })
  }

  createGame(type, options) {
    if (this.gameType) throw new Error(`Game already initialized`)
    addDefaultOptions(options, {type: 'pacman', tileWidth: 16})

    this.gameType = type
    if (type == 'pacman') {
      this.addCamera({cameraMode: 'auto', cameraOverflow: 'display', ratio: 16 / 9, cameraWidth: 480})
      this.camera.addTileLayer()
      this.camera.addSpriteLayer()

      this.addMaps({tileWidth: options.tileWidth, type: 'pacman'})
      this.addECS()

      this.addPreFunction(() => { this.camera.noSmooth() })
    } else {
      throw new Error(`unknown game type: ${type}`)
    }
  }

  createMenu(Constructor, name, options = {}) {
    //if the only parameter is a string, create default menu
    if (typeof Constructor == 'string') return this.createMenu(Menu, Constructor)
    if (!name) name = Constructor.name.toLowerCase()
    const {statusName} = this

    addDefaultOptions(options, {json: true, path: '/img/menus', mainImage: {}, cameraMode: 'auto', cameraOverflow: 'hidden'})

    //create menu
    const menu = new Constructor()
    menu.status = status
    const sprite = menu.sprite = p5.prototype.menuSprites[statusName] = {}

    //load main if necessary
    if (options.mainImage) {
      const opt = addDefaultOptions(options.mainImage, {json: false, path: '/img/menus'})
      loadSpriteSheet(name, opt, img => sprite.main = img)
    }

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
        p5.prototype.listenInputs(menu, statusName)

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

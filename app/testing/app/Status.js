class Status extends Master {
  constructor(statusName) {
    super()
    this.preFunctions = []
    this.postFunctions = []
    this.updateFunctions = []
    this.fixedUpdateFunctions = []
    this.pre = () => { }
    this.post = () => { }
    this.update = () => { }

    //get statusName and if a menuSprite was already loaded, add a reference to it
    this.statusName = deCapitalize(this.constructor.name)
    if (menuSprites[this.statusName]) this.sprite = menuSprites[this.statusName]

    this.camera = new Camera()
    this.ecs = new ECS()

    this._x = this._y = 0
  }

  get x() { return this._x + this.camera.canvas.xOff }
  get y() { return this._y + this.camera.canvas.yOff }
  set x(x) { this._x = x }
  set y(y) { this._y = y }

  addPreFunction(fun) { this.preFunctions.push(fun) }
  addPostFunction(fun) { this.postFunctions.push(fun) }
  addUpdateFunction(fun) { this.updateFunctions.push(fun) }
  addFixedUpdateFunction(fun) { this.fixedUpdateFunctions.push(fun) }

  _pre(...args) { this.preFunctions.forEach(fun => fun(...args)); this.pre(...args) }
  _post(...args) { this.postFunctions.forEach(fun => fun(...args)); this.post(...args) }
  _update() { this.updateFunctions.forEach(fun => fun()); this.ecs.update(); this.camera.update() }
  _fixedUpdate() { this.fixedUpdateFunctions.forEach(fun => fun()); this.ecs.fixedUpdate() }

  getSprite() { return this.camera.getSprite() }

  spawn(entity) { p5.prototype.spawnOne() }

  createMenu(Constructor, name, options = {}) {
    console.log('asdfknasdhkjfhkjasdfkl');
    //if the only parameter is a string, create default menu
    if (typeof Constructor == 'string') return this.createMenu(Menu, Constructor)
    if (!name) name = Constructor.name.toLowerCase()
    const {statusName} = this

    addDefaultOptions(options, {json: true, path: '/img/menus', mainImage: {}, cameraMode: 'auto', cameraOverflow: 'hidden'})

    //create menu
    const menu = new Constructor()
    menu.status = status
    menu.sprite = p5.prototype.menuSprites[statusName]


    //listen to inputs
    menu.listenInputs('click')

    //add camera and addForegroundLayer
    this.addCamera({cameraMode: 'auto', cameraOverflow: 'hidden', ratio: 16 / 9, cameraWidth: 1920})
    this.camera.addForegroundLayer(menu._getSprite.bind(menu))
  }
}
/*
  createMenu(String)
  createMenu(Constructor)
  createMenu(Constructor, String)
*/

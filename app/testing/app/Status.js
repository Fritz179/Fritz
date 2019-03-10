class Status {
  constructor() {
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
  _pre(args) { this.preFunctions.forEach(fun => fun(...args)); this.pre(...args) }
  _post(args) { this.postFunctions.forEach(fun => fun(...args)); this.post(...args) }

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
      this.addCamera({cameraMode: 'multiple', cameraOverflow: 'hidden', ratio: 16 / 9, cameraWidth: 480})
      this.camera.addTileLayer()
      this.camera.addSpriteLayer()

      this.addMaps({tileWidth: options.tileWidth, type: 'pacman'})
      this.addECS()

      this.addPreFunction(() => { this.camera.noSmooth() })
    } else {
      throw new Error(`unknown game type: ${type}`)
    }
  }

  createMenu() {
    console.log('createmnenu');
    //       smooth()
  }
}

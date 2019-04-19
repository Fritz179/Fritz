class Status extends Layer {
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
    this.sprite = menuSprites[this.statusName] || {}

    this.listener = new Listener()
    this.camera = new Camera(this)
    this.ecs = new ECS(this)

    this.spawn = this.ecs.spawn

    this.camera.settings({w : 1920, h: 1080, mode: 'auto', overflow: 'hidden'})
    this.setSize(1920, 1080)
  }

  addPreFunction(fun) { this.preFunctions.push(fun) }
  addPostFunction(fun) { this.postFunctions.push(fun) }
  addUpdateFunction(fun) { this.updateFunctions.push(fun) }
  addFixedUpdateFunction(fun) { this.fixedUpdateFunctions.push(fun) }

  _pre(...args) { this.preFunctions.forEach(fun => fun(...args)); this.pre(...args) }
  _post(...args) { this.postFunctions.forEach(fun => fun(...args)); this.post(...args) }
  _update() { this.updateFunctions.forEach(fun => fun()); this.ecs.update();}
  _fixedUpdate() { this.fixedUpdateFunctions.forEach(fun => fun()); this.ecs.fixedUpdate() }

  getSprite(oldRealX, oldRealY) {
    if (this.resizedGraphic) {
      this.camera.resize()
      this.resizedGraphic = false
    }

    const sprite = this.camera.getSprite(oldRealX, oldRealY)

    //if the canvas alredy has the rigth dimensions, just return it
    //otherwise draw it on the port
    if (sprite.width == this.w && sprite.height == this.h) {
      return sprite
    } else {
      //draw and return it
      this.graphic.image(sprite, this.camera.w2, this.camera.h2, this.camera.w3, this.camera.h3)
    }
    return this.graphic
  }
}

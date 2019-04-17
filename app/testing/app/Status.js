class Status extends Entity {
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

  get w() { return this.camera ? this.camera.w : 0}
  get h() { return this.camera ? this.camera.h : 0 }

  set w(w) { return this.setSize(w, this.h) }
  set h(h) { return this.setSize(this.w, h) }

  setSize(w, h) { if (this.camera) this.camera.setSize(w, h) }

  addPreFunction(fun) { this.preFunctions.push(fun) }
  addPostFunction(fun) { this.postFunctions.push(fun) }
  addUpdateFunction(fun) { this.updateFunctions.push(fun) }
  addFixedUpdateFunction(fun) { this.fixedUpdateFunctions.push(fun) }

  _pre(...args) { this.preFunctions.forEach(fun => fun(...args)); this.pre(...args) }
  _post(...args) { this.postFunctions.forEach(fun => fun(...args)); this.post(...args) }
  _update() { this.updateFunctions.forEach(fun => fun()); this.ecs.update();}
  _fixedUpdate() { this.fixedUpdateFunctions.forEach(fun => fun()); this.ecs.fixedUpdate() }

  getSprite(getRealX, getRealY) { return this.camera.getSprite(getRealX, getRealY) }
}
/*
  createMenu(String)
  createMenu(Constructor)
  createMenu(Constructor, String)
*/

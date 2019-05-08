class Camera extends Layer {
  constructor(parent) {
    super()

    this._status = parent
    this.layers = []

    this.toFollow = false
    this.multiplierX = this.multiplierY = 1
    this.cameraWidth = this.cameraHeight = 100
    this.mode = 'auto'
    this.overflow = 'display'
  }

  getSprite(oldMouseX, oldMouseY) {
    //center the camera, move it in the right position
    this.centerFollower()

    const {x3, y3, multiplierX, multiplierY, graphic, layers} = this
    const newMouseX = this._status.cameraX = oldMouseX / this._status.w1 * this.cameraWidth
    const newMouseY = this._status.cameraY = oldMouseY / this._status.h1 * this.cameraHeight

    graphic.background(0)

    //draw every layer
    layers.forEach(layer => {
      const sprite = layer.getSprite(newMouseX, newMouseY)
      graphic.image(sprite, -x3 + layer.x3, -y3 + layer.y3)
    })

    return this.graphic
  }

  noSmooth() {
    this.layers.forEach(layer => layer.graphic.noSmooth())
    this.graphic.noSmooth()
    noSmooth()
  }

  settings(settings = {}) {
    let {w, h, r, mode, overflow} = settings

    if (mode) this.mode = mode
    if (overflow) this.overflow = overflow

    if (w || h || r) {
      const camera = getCameraSize(w, h, r)
      if (camera.w) this.cameraWidth = camera.w
      if (camera.h) this.cameraHeight = camera.h
    }

    this.resize()
  }

  centerFollower() {
    const {toFollow} = this

    if (toFollow) this.center = toFollow.center
    else this.setPos(0, 0)
  }

  resize() {
    this.resizedGraphic = false

    const {cameraWidth, cameraHeight, mode, overflow, graphic} = this
    const {w, h} = this._status
    let multiplierX, multiplierY

    if (mode == 'multiple') {
      multiplierX = (w - (w % cameraWidth)) / cameraWidth
      multiplierY = (h - (h % cameraHeight)) / cameraHeight
      multiplierX = multiplierY = multiplierX < multiplierY ? multiplierX : multiplierY
    } else if (mode == 'auto') {
      multiplierX = w / cameraWidth
      multiplierY = h / cameraHeight
      multiplierX = multiplierY = multiplierX < multiplierY ? multiplierX : multiplierY
    } else if (mode == 'original') {
      multiplierX = multiplierY = 1
    } else if (mode == 'strech') {
      multiplierX = w / cameraWidth
      multiplierY = h / cameraHeight
    } else {
      console.error('// TODO: cameraMode not multiple or auto or original or strech?');
    }

    this.multiplierX = multiplierX
    this.multiplierY = multiplierY

    if (overflow == 'hidden') {
      this.setSize(cameraWidth, cameraHeight)
      const marginX = round(w - cameraWidth * multiplierX)
      const marginY = round(h - cameraHeight * multiplierY)
      this._status.setDiff(marginX / 2, marginY / 2)
      this._status.setSpriteSize(w - marginX, h - marginY)
    } else if (overflow == 'display') {
      console.error('// TODO: display?');
      this.setSize(w, h)
      this._status.setDiff(0, 0)
      this.setSpriteSize(w, h)
    } else {
      console.error('// TODO: overflow not hidder or display?');
    }

    this.layers.forEach(layer => {
      layer.setSize(cameraWidth, cameraHeight)
    })
  }

  follow(e) {
    console.log('following', e);
    this.toFollow = e
  }

  addLayer(layer) {
    if (!(layer instanceof Layer)) throw new Error('Invalid Layer => it must extend Layer')

    layer._status = this._status
    layer.camera = this
    layer.setSize(this.w, this.h)

    this.layers.push(layer)
  }

  addBackgroundLayer(img) { this.addLayer(new BackgroundLayer(img)) }
  addTileLayer() { this.addLayer(new TileLayer(this)) }
  addSpriteLayer() { this.addLayer(new SpriteLayer(this)) }
}

function getCameraSize(w, h, r) {

  //if alredy given
  if (w && h && r) {
    //if is alredy correct
    if (w / h == r) return {w, h, r}

    //else get the smalles and round it
    h * r > w ? h = round(w / r) : w = round(h * r)
    return {w, h}
  }

  if (w && h) r = w / h
  else if (w && r) h = w / r
  else if (h && r) w = h * r
  else throw new Error(`Not enought params for camera!`)

  return {w, h, r}
}

class Camera extends Layer {
  constructor(parent) {
    super()

    this._status = parent
    this.layers = []

    this.camera = createGraphics(100, 100)
    this.camera.noSmooth()

    this.setPos(0, 0)

    this.toFollow = false
    this.multiplierX = this.multiplierY = 1
    this.cameraWidth = this.cameraHeight = 100
    this.mode = 'auto'
    this.overflow = 'display'
  }

  getSprite(oldRealX, oldRealY) {
    //it gets resized only before drawing, this is to prevent resizing multiple without drawing
    //resizing the p5 defaultCanvas0 also calls draw
    if (this.resizedGraphic) this.resize()

    //center the camera, move it in the right position
    this.centerFollower()
    const {x1, y1, xc, yc, x2, y2, multiplierX, multiplierY, camera, graphic, layers} = this

    //create new formula to get the realX and realY
    const getRealX = x => oldRealX(x * multiplierX + canvas.xOff)
    const getRealY = y => oldRealY(y * multiplierY + canvas.yOff)

    graphic.strokeWeight(1)
    graphic.fill(debugEnabled ? 30 : 0)
    graphic.rect(-10, -10, graphic.width + 20, graphic.height + 20)
    camera.clear()

    layers.forEach(layer => {
      const sprite = layer.getSprite(getRealX, getRealY)
      camera.image(sprite, -x1 + layer.x1, -y1 + layer.y1)
    })

    //if the canvas alredy has the rigth dimensions, just return it
    //otherwise draw it on the port
    if (multiplierX == 1 && multiplierY == 1) {
      return camera
    } else {
      const w = round(camera.width * multiplierX), h = round(camera.height * multiplierY)
      //if (w != graphic.width || h != graphic.height) debugger

      //draw and return it

      graphic.image(camera, camera.xOff, camera.yOff, w, h)
      return graphic
    }
  }

  noSmooth() {
    this.layers.forEach(layer => layer.graphic.noSmooth())
    this.graphic.noSmooth()
    this.camera.noSmooth()
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
    const {cameraWidth, cameraHeight, toFollow} = this

    if (toFollow) this.setPos(toFollow.xc - cameraWidth / 2, toFollow.yc - cameraHeight / 2)
    else this.setCenter(this.w / 2, this.h / 2)
  }

  resize() {
    this.resizedGraphic = false

    const {cameraWidth, cameraHeight, mode, overflow, graphic} = this
    const w = graphic.width, h = graphic.height
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
    this.camera.xOff = this.camera.yOff = 0

    this.camera.remove()
    if (overflow == 'hidden') {
      this.camera = createGraphics(cameraWidth, cameraHeight)
      this.camera.xOff = round((w - cameraWidth * multiplierX) / 2)
      this.camera.yOff = round((h - cameraHeight * multiplierY) / 2)
    } else if (overflow == 'display') {
      this.camera = createGraphics(w, h)
    } else {
      console.error('// TODO: overflow not hidder or display?');
    }
    this.camera.noSmooth()

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
    layer.setSize(this.camera.width, this.camera.height)

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

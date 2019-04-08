class Camera {
  constructor(parent) {
    this.status = parent
    this.layers = []
    this.port = createGraphics(100, 100)
    this.canvas = createGraphics(100, 100)
    this.toFollow = false
    this.x1 = this.y1 = 0
    this.x2 = this.y2 = 100
    this.xc = this.yc = 50
    this.multiplierX = this.multiplierY = 1
    this.settings({cameraMode: 'auto', cameraOverflow: 'display', ratio: 16 / 9, cameraWidth: 480})
  }

  update(oldRealX, oldRealY) {
    //it gets resized only before drawing, this is to prevent resizing multiple without drawing
    //resizing the p5 defaultCanvas0 also calls draw
    if (this.toResize) {
      this.toResize = false
      this.resize()
    }

    //center the camera, move it in the right position
    this.center()
    const {x1, y1, xc, yc, x2, y2, multiplierX, multiplierY, canvas, layers} = this

    //create new formula to get the realX and realY
    const getRealX = x => oldRealX(x * multiplierX + canvas.xOff)
    const getRealY = y => oldRealY(y * multiplierY + canvas.yOff)

    canvas.fill(debugEnabled ? 30 : 0)
    canvas.rect(-10, -10, canvas.width + 20, canvas.height + 20)
    canvas.strokeWeight(1)

    layers.forEach(layer => {
      if (typeof layer.update == 'function') layer.update(getRealX, getRealY)
      canvas.image(layer, -x1 + (layer.x1 || 0), -y1 + (layer.y1 || 0))
    })

    if (debugEnabled) {
      layers.forEach(layer => {
        if (typeof layer.debugg == 'function') layer.debugg()
      })
      canvas.noFill()
      canvas.strokeWeight(2)
      canvas.stroke(255)
      canvas.rect(0, 0, canvas.width - 1, canvas.height - 1)
    }
  }

  getSprite(getRealX, getRealY) {
    this.update(getRealX, getRealY)

    const {canvas, port, multiplierX, multiplierY} = this

    //if the canvas alredy has the rigth dimensions, just return it
    //otherwise draw it on the port
    if (multiplierX == 1 && multiplierY == 1) {
      return canvas
    } else {
      const w = round(canvas.width * multiplierX), h = round(canvas.height * multiplierY)

      //check if port has the right dimensions
      if (port.width != w || port.height != h) port.size(w, h)

      //draw and return it
      port.image(canvas, 0, 0, w, h)
      return port
    }
  }

  addSpriteLayer() {
    if (this._spriteLayer) return
    this._spriteLayer = true

    const spriteLayer = createGraphics()

    spriteLayer.update = (getRealX, getRealY) => {
      const {x1, y1, canvas} = this
      const {entities, animations} = this.status.ecs

      canvas.noFill()
      canvas.stroke(255, 0, 0)

      let types = [entities, animations].forEach(type => {
        type.forEach(e => {
          e._getRealX = x => getRealX(x - x1)
          e._getRealY = y => getRealY(y - y1)
          if (p5.prototype.collideRectRect(this, e)) {
            //get the sprite and pos of the entity
            let sprite = e.getSprite(), x = round(e.x - x1), y = round(e.y - y1)
            //if a sprite is returned, draw it else if false is returned don't draw
            //but if nothing is retunred, throw an error

            if (sprite) canvas.image(sprite, x, y)
            else if (sprite !== false) {
              console.error('Illegal return of getSprite: ', e);
              throw new Error('If no sprite must be drawn, return false')
            }

            //if debugEnabled draw the hitbox
            if (debugEnabled) canvas.rect(round(e.x - x1), round(e.y - y1), round(e.w - 1), round(e.h - 1))
          }
        })
      })
    }

    spriteLayer.updateSize = () => {
      spriteLayer.size(this.canvas.width, this.canvas.height)
    }

    this.layers.push(spriteLayer)
  }

  addTileLayer() {
    const tileLayer = createGraphics(16, 16)

    tileLayer.redrawAll = () => {
      const {w, h, s, graphicalMap} = this.status.maps
      const {canvas} = this
      const xc = tileLayer.xc = this.xc
      const yc = tileLayer.yc = this.yc
      tileLayer.size(canvas.width * 3, canvas.height * 3)

      tileLayer.x1 = floor(xc - tileLayer.width / 2)
      tileLayer.y1 = floor(yc - tileLayer.height / 2)
      tileLayer.x2 = ceil(xc + tileLayer.width / 2)
      tileLayer.y2 = ceil(yc + tileLayer.height / 2)
      const x1 = floor(tileLayer.x1 / s)
      const y1 = floor(tileLayer.y1 / s)
      const xm = ceil(tileLayer.width / s)
      const ym = ceil(tileLayer.height / s)
      const xd = round((xc - tileLayer.width / 2) - x1 * s)
      const yd = round((yc - tileLayer.height / 2) - y1 * s)

      if (!Number.isInteger(x1) || !Number.isInteger(xd)) throw new Error(`Invalid tilelayer redraw, maybe map not parsed?`)

      for (let y = 0; y < ym; y++) {
        for (let x = 0; x < xm; x++) {
          const i = xyi(x + x1, y + y1)
          if (i != -1) tileLayer.image(p5.prototype.sprites.tiles[graphicalMap[i]], x * s - xd, y * s - yd, s, s)
        }
      }
    }

    tileLayer.redraw = tiles => {
      tiles.forEach(tile => {
        console.log('// TODO: tileLayer.redraw()');
      })
    }

    tileLayer.update = () => {
      if (!p5.prototype.rectInsideRect(this, tileLayer)) {
        if (debugEnabled) console.log('redrawing tileLayer');
        tileLayer.redrawAll()
      }
    }

    tileLayer.debugg = () => {
      const {w, h, s} = this.status.maps
      //draw map border
      stroke(255, 0, 0)
      drawBox({x1: 0, y1: 0, x2: w * s, y2: h * s}, this)
      //draw tileLayer border
      stroke(255, 255, 0)
      drawBox(tileLayer, this)

      function drawBox(a, b) {
        rect(txx(a.x1), tyy(a.y1), txx(a.x2) - txx(a.x1), tyy(a.y2) - tyy(a.y1))
        line(txx(b.x1), tyy(b.y1), txx(a.x1), tyy(a.y1))
        line(txx(b.x1), tyy(b.y2), txx(a.x1), tyy(a.y2))
        line(txx(b.x2), tyy(b.y1), txx(a.x2), tyy(a.y1))
        line(txx(b.x2), tyy(b.y2), txx(a.x2), tyy(a.y2))
      }
    }

    this.layers.push(tileLayer)
  }

  addBackgroundLayer(img) {
    this.layers.push(img)
  }

  addForegroundLayer(updateFun) {
    const foreGroundLayer = createGraphics(this.cameraWidth, this.cameraHeight)

    foreGroundLayer.update = () => updateFun(foreGroundLayer)

    foreGroundLayer.updateSize = () => {
      foreGroundLayer.size(this.cameraWidth, this.cameraHeight)
    }

    this.layers.push(foreGroundLayer)
  }

  noSmooth() {
    this.layers.forEach(layer => layer.noSmooth())
    this.canvas.noSmooth()
    this.port.noSmooth()
    noSmooth()
  }

  settings(settings = {}) {
    addDefaultOptions(settings, {cameraMode: this.cameraMode, cameraOverflow: this.cameraOverflow})
    addDefaultOptions(settings, getCameraRatio(settings))
    this.cameraMode = settings.cameraMode
    this.cameraOverflow = settings.cameraOverflow
    this.cameraWidth = settings.cameraWidth
    this.cameraHeight = settings.cameraHeight
    this.ratio = settings.ratio
    this.toResize = true
  }

  center() {
    const canvas = this.canvas
    this.xc = this.toFollow ? round(this.toFollow.x1 + (this.toFollow.x2 - this.toFollow.x1) / 2) : canvas.width / 2
    this.yc = this.toFollow ? round(this.toFollow.y1 + (this.toFollow.y2 - this.toFollow.y1) / 2) : canvas.height / 2
    this.x1 = floor(this.xc - canvas.width / 2)
    this.y1 = floor(this.yc - canvas.height / 2)
    this.x2 = ceil(this.xc + canvas.width / 2)
    this.y2 = ceil(this.yc + canvas.height / 2)
  }

  resize() {
    console.log('resizing');
    const {cameraWidth, cameraHeight, cameraMode, cameraOverflow, canvas} = this
    resizingCamera = true
    resizeCanvas(windowWidth, windowHeight);

    canvas.xOff = 0
    canvas.yOff = 0
    let multiplierX, multiplierY

    if (cameraMode == 'multiple') {
      multiplierX = (width - (width % cameraWidth)) / cameraWidth
      multiplierY = (height - (height % cameraHeight)) / cameraHeight
      multiplierX = multiplierY = multiplierX < multiplierY ? multiplierX : multiplierY
    } else if (cameraMode == 'auto') {
      multiplierX = width / cameraWidth
      multiplierY = height / cameraHeight
      multiplierX = multiplierY = multiplierX < multiplierY ? multiplierX : multiplierY
    } else if (cameraMode == 'original') {
      multiplierX = multiplierY = 1
    } else if (cameraMode == 'strech') {
      multiplierX = width / cameraWidth
      multiplierY = height / cameraHeight
    } else {
      console.error('// TODO: cameraMode not multiple or auto or strech?');
    }

    this.multiplierX = multiplierX
    this.multiplierY = multiplierY

    if (cameraOverflow == 'hidden') {
      canvas.size(cameraWidth, cameraHeight)
      canvas.xOff = round((width - cameraWidth * multiplierX) / 2)
      canvas.yOff = round((height - cameraHeight * multiplierY) / 2)
    } else if (cameraOverflow == 'display') {
      canvas.xOff = canvas.yOff = 0
      canvas.size(ceil(windowWidth / multiplierX), ceil(windowHeight / multiplierY))
    } else {
      console.error('// TODO: cameraOverflow not hidder or display?');
    }

    this.layers.forEach(layer => {
      if (typeof layer.updateSize == 'function') layer.updateSize()
    })
  }

  follow(e) {
    this.toFollow = e
  }
}

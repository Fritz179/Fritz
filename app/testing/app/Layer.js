class Layer extends Master {
  constructor() {
    super()

    this.graphic = createGraphics(100, 100)
    this.resizedGraphic = true;

    this.camera = null
    this._status = null
  }

  get w() { return this.graphic ? this.graphic.width : 0 }
  get h() { return this.graphic ? this.graphic.height : 0 }

  set w(w) { return this.setSize(w, this.h) }
  set h(h) { return this.setSize(this.w, h) }

  setSize(w, h) {
    if (this.graphic && (this.graphic.width != w || this.graphic.height != h)) {
      this.graphic.remove()
      this.graphic = createGraphics(w, h)

      if (this.camera) {
        if (this.camera._toSmooth) this.graphic.smooth()
        else this.graphic.noSmooth()
      }

      this.resizedGraphic = true;
    }
    return this
  }

  getSprite(getRealX, getRealY, getMouseX, getMouseY) {
    this.update(getRealX, getRealY, getMouseX, getMouseY)
    return this.graphic
  }

  update() {
    throw new Error(`No update in layer: ${this.constructor.name}`)
  }
}

class SpriteLayer extends Layer {
  constructor(parent) {
    super()

    this.ecs = parent._status.ecs
  }

  update(getMouseX, getMouseY, getPmouseX, getPmouseY) {
    this.center = this.camera.center

    const {x1, y1} = this
    const {entities} = this.ecs
    const {graphic} = this

    graphic.clear()
    graphic.noFill()
    graphic.strokeWeight(1)
    graphic.stroke(255, 0, 0)

    entities.forEach(e => {
      e._mouseX = () => getMouseX() - e.x1
      e._mouseY = () => getMouseY() - e.y1
      e._pmouseX = () => getPmouseX() - e.x1
      e._pmouseY = () => getPmouseY() - e.y1

      if (p5.prototype.collideRectRect(this, e)) {
        //get the sprite and pos of the entity
        let sprite = e.getSprite(getMouseX, getMouseY, getPmouseX, getPmouseY), x = round(e.x3 - x1), y = round(e.y3 - y1)
        //if a sprite is returned, draw it else if false is returned don't draw
        //but if nothing is retunred, throw an error
        if (sprite) graphic.image(sprite, x, y)
        else if (sprite !== false) {
          console.error('Illegal return of getSprite: ', e);
          throw new Error('If no sprite must be drawn, return false')
        }

        //if debugEnabled draw the hitbox
        if (debugEnabled) {
          graphic.rect(round(e.x - x1), round(e.y - y1), round(e.w - 1), round(e.h - 1))
          // graphic.line(round(e.x - x1), round(e.y - y1), round(e.x2 - 1 - x1), round(e.y2 - 1 - y1))
          // graphic.line(round(e.x - x1), round(e.y2 - 1 - y1), round(e.x2 - 1 - x1), round(e.y - y1))
        }
      }
    })
  }
}

class TileLayer extends Layer {
  constructor(parent) {
    super()

    this.maps = parent._status
  }

  update() {
    const {camera} = this
    const rect = {x1: camera.x1, y1: camera.y1, x2: camera.x1 + camera.cameraWidth, y2: camera.y1 + camera.cameraHeight}

    // if (!p5.prototype.rectInsideRect(rect, this)) {
    //   console.log('redrawing tileLayer');
    //   this.redrawAll()
    // }
    this.setPos(camera.x, camera.y)
    this.graphic.clear()

    this.maps.chunks.forEach((col, x) => {
      col.forEach((chunk, y) => {
        this.graphic.image(chunk.graphic, x * this.maps.chunkWidth - camera.x, y * this.maps.chunkHeight - camera.y)
      })
    })
  }

  redrawAll() {
    const {w, h, s, graphicalMap} = this.maps
    let {cameraWidth, cameraHeight} = this.camera

    {
      //set new size
      const w = cameraWidth * 3, h = cameraHeight * 3
      this.setSize(w, h)
      this.graphic.clear()
    }

    const graphic = this.graphic

    //set and get new center
    this.setPos(this.camera.x1 - cameraWidth, this.camera.y1 - cameraHeight)
    const {xc, yc} = this

    const x1 = floor(this.x1 / s)
    const y1 = floor(this.y1 / s)
    const xm = ceil(this.w / s)
    const ym = ceil(this.h / s)
    const xd = round((xc - this.w / 2) - x1 * s)
    const yd = round((yc - this.h / 2) - y1 * s)
    if (!Number.isInteger(x1) || !Number.isInteger(xd)) throw new Error(`Invalid tilelayer redraw, maybe map not parsed?`)

    for (let y = 0; y < ym; y++) {
      for (let x = 0; x < xm; x++) {
        const i = xyi(x + x1, y + y1)
        //if (i != -1) graphic.image(p5.prototype.sprites.tiles[graphicalMap[i]], x * s - xd, y * s - yd, s, s)
      }
    }
  }
}

class BackgroundLayer extends Layer {
  constructor(img) {
    super()

    this.img = img
  }

  update() {
    if (this.resizedGraphic) {
      this.resizedGraphic = false

      if (this.camera._toSmooth) this.graphic.smooth()
      else this.graphic.noSmooth()
      this.redraw()
    }
  }

  redraw() {
    this.graphic.image(this.img, 0, 0, this.graphic.width, this.graphic.height)
  }

  setImg(img) {
    this.img = img
    this.setSize(img.width, img.height)
    this.redraw()
  }
}

let spriteLayer, tileLayer, backgroundLayer, canvas, toFollow, layers, camera = {}
function startCamera() {
  //create canvas and set default options with helper functions
  createCanvas(windowWidth, windowHeight)
  spriteLayer = createGraphics()
  tileLayer = createGraphics()
  backgroundLayer = createGraphics()
  if (gameSettings.type == 'pacman') {
    canvas = createGraphics()
    noSmooth()
    canvas.noSmooth()
    spriteLayer.noSmooth()
    tileLayer.noSmooth()
    layers = [tileLayer, spriteLayer]
  }

  tileLayer.redrawAll = () => {
    const {w, h, s, graphicalMap} = p5.prototype.maps
    const xc = tileLayer.xc = camera.xc
    const yc = tileLayer.yc = camera.yc
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

  //size camera
  resizeCamera()

  centerCamera()
  tileLayer.redrawAll()
}

function resizeCamera() {
  const {cameraWidth, cameraHeight, cameraMode, cameraOverflow} = gameSettings
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
  camera.multiplierX = multiplierX
  camera.multiplierY = multiplierY

  if (cameraOverflow == 'hidden') {
    canvas.size(cameraWidth, cameraHeight)
    canvas.xOff = round((width - cameraWidth * multiplierX) / 2)
    canvas.yOff = round((height - cameraHeight * multiplierY) / 2)
  } else if (cameraOverflow == 'display') {
    canvas.xOff = canvas.yOff = 0
    canvas.size(ceil(windowWidth / multiplierX), ceil(windowHeight / multiplierY))
  } else {
    console.log('// TODO: cameraOverflow not hidder or display?');
  }
  spriteLayer.size(canvas.width, canvas.height)
}

window.windowResized = () => {
  resizeCamera()
}

p5.prototype.follow = e => {
  toFollow = e
}

function updateTileLayer(tiles) {
  if (!tiles) {

  } else {
    tiles.forEach(tile => {
      console.log('// TODO: single tile graphical update');
    })
  }
}

function redrawLayers() {
  centerCamera()
  const {x1, y1, xc, yc, x2, y2, multiplierX, multiplierY} = camera
  const {entities, animations} = ecs

  if (!p5.prototype.rectInsideRect(camera, tileLayer)) {
    if (debugEnabled) console.log('redrawing tileLayer');
    tileLayer.redrawAll()
  }

  background(debugEnabled ? 51 : 0)

  canvas.fill(debugEnabled ? 30 : 0)
  canvas.rect(-10, -10, canvas.width + 20, canvas.height + 20)
  canvas.image(tileLayer, -x1 + tileLayer.x1, -y1 + tileLayer.y1)
  // for (let i = 0; i < 100000; i++) {
  //   if (p5.prototype.collideRectRect(camera, {x1: -100, y1: -100, x2: -84, y2: -84})) {
  //     canvas.image(sprites.player.idle, -100 -x1, -100 -y1)
  //   }
  // }
  canvas.noFill()
  canvas.strokeWeight(1)
  canvas.stroke(255, 0, 0)
  for (let i = entities.length - 1; i >= 0; i--) {
    if (p5.prototype.collideRectRect(camera, entities[i])) {
      canvas.image(entities[i].getSprite(), round(entities[i].x - x1), round(entities[i].y - y1))
      if (debugEnabled) canvas.rect(round(entities[i].x - x1), round(entities[i].y - y1), round(entities[i].w - 1), round(entities[i].h - 1))
    }
  }

  for (let i = animations.length - 1; i >= 0; i--) {
    if (p5.prototype.collideRectRect(camera, animations[i])) {
      canvas.image(animations[i].getSprite(), round(animations[i].x - x1), round(animations[i].y - y1))
      if (debugEnabled) canvas.rect(round(animations[i].x - x1), round(animations[i].y - y1), round(animations[i].w - 1), round(animations[i].h - 1))
    }
  }
  // canvas.stroke(255, 0, 0)
  // canvas.line(100, 0, canvas.width, canvas.height)
  image(canvas, round(canvas.xOff), round(canvas.yOff), round(canvas.width * multiplierX), round(canvas.height * multiplierY))

  if (debugEnabled) {
    noFill()
    strokeWeight(2)
    stroke(255)
    rect(round(canvas.xOff), round(canvas.yOff), round(canvas.width * multiplierX) - 1, round(canvas.height * multiplierY) - 1)

    //draw map edge
    const {w, h, s} = p5.prototype.maps
    stroke(255, 0, 0)
    rect(txx(0), tyy(0), txx(w * s) - txx(0), tyy(h * s) - tyy(0))
    line(txx(0), tyy(0), txx(camera.x1), tyy(camera.y1))
    line(txx(w * s), tyy(0), txx(camera.x2), tyy(camera.y1))
    line(txx(0), tyy(h * s), txx(camera.x1), tyy(camera.y2))
    line(txx(w * s), tyy(h * s), txx(camera.x2), tyy(camera.y2))

    //draw tileLayer edge
    stroke(255, 255, 0)
    rect(txx(tileLayer.x1), tyy(tileLayer.y1), txx(tileLayer.x2) - txx(tileLayer.x1), tyy(tileLayer.y2) - tyy(tileLayer.y1))
    line(txx(camera.x1), tyy(camera.y1), txx(tileLayer.x1), tyy(tileLayer.y1))
    line(txx(camera.x1), tyy(camera.y2), txx(tileLayer.x1), tyy(tileLayer.y2))
    line(txx(camera.x2), tyy(camera.y1), txx(tileLayer.x2), tyy(tileLayer.y1))
    line(txx(camera.x2), tyy(camera.y2), txx(tileLayer.x2), tyy(tileLayer.y2))
  }
}

function centerCamera() {
  const xc = camera.xc = toFollow ? round(toFollow.x1 + (toFollow.x2 - toFollow.x1) / 2) : 0
  const yc = camera.yc = toFollow ? round(toFollow.y1 + (toFollow.y2 - toFollow.y1) / 2) : 0
  camera.x1 = floor(xc - canvas.width / 2)
  camera.y1 = floor(yc - canvas.height / 2)
  camera.x2 = ceil(xc + canvas.width / 2)
  camera.y2 = ceil(yc + canvas.height / 2)
}

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
  if (cameraMode == 'multiple') {
    const multipleX = (width - (width % cameraWidth)) / cameraWidth
    const multipleY = (height - (height % cameraHeight)) / cameraHeight
    const multiplier = camera.multiplier = multipleX < multipleY ? multipleX : multipleY
    canvas.xOff = (width - cameraWidth * multiplier) / 2
    canvas.yOff = (height - cameraHeight * multiplier) / 2
  } else if (cameraMode == 'auto') {
    const multipleX = width / cameraWidth
    const multipleY = height / cameraHeight
    camera.multiplier = multipleX < multipleY ? multipleX : multipleY
  } else {
    console.log('// TODO: cameraMode not multiple or auto?');
  }

  if (cameraOverflow == 'hidden') {
    canvas.size(cameraWidth, cameraHeight)
  } else if (cameraOverflow == 'display') {
    canvas.size(ceil(width / multiple), ceil(height / multiple))
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
  const {x1, y1, xc, yc, x2, y2, multiplier} = camera
  const {entities, animations} = ecs

  if (!p5.prototype.rectInsideRect(camera, tileLayer)) {
    console.log('redrawing tileLayer');
    tileLayer.redrawAll()
  }

  background(51)

  canvas.fill(30)
  canvas.rect(-10, -10, canvas.width + 20, canvas.height + 20)
  canvas.image(tileLayer, -x1 + tileLayer.x1, -y1 + tileLayer.y1)

  for (let i = entities.length - 1; i >= 0; i--) {
    canvas.image(entities[i].getSprite(), round(entities[i].x - x1), round(entities[i].y - y1))
  }

  for (let i = animations.length - 1; i >= 0; i--) {
    canvas.image(animations[i].getSprite(), round(animations[i].x - x1), round(animations[i].y - y1))
  }

  image(canvas, round(canvas.xOff), round(canvas.yOff), round(canvas.width * multiplier), round(canvas.height * multiplier))

  if (debugEnabled) {
    noFill()
    strokeWeight(2)
    stroke(255)
    rect(round(canvas.xOff), round(canvas.yOff), round(canvas.width * multiplier), round(canvas.height * multiplier))
    const x0 = round(-x1 * multiplier + canvas.xOff), y0 = round(-y1 * multiplier + canvas.yOff)
    stroke(255, 255, 0)
    rect(x0 + tileLayer.x1 * multiplier, y0 + tileLayer.y1 * multiplier, tileLayer.width * multiplier, tileLayer.height * multiplier)
    stroke(0, 0, 255)
    line(x0, y0, x0 + xc * multiplier, y0 + yc * multiplier)
    // noFill()
    // stroke(255)
    // rect(round(startX), round(startY), round(toW), round(toH))
    // stroke(255, 0, 0)
    // rect(round(-x1 * multiple + startX), round(-y1 * multiple + startY), round(tileLayer.width * multiple), round(tileLayer.height * multiple))
    // stroke(0, 0, 255)
    // const x0 = round(-x1 * multiple + startX), y0 = round(-y1 * multiple + startY)
    // line(x0 + x * multiple, y0 + y * multiple, x0, y0)
    // fill(255)
    // noStroke()
    // textSize(30)
    // text(`X: ${player.x}`, 50, 50)
    // text(`Y: ${player.y}`, 50, 100)
    // text(`Framerate: ${round(frameRate())}`, 50, 150)
    // text(`XV: ${player.xv}`, 200, 50)
    // text(`YV: ${player.yv}`, 200, 100)
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

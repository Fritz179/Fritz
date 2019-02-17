let spriteLayer, tileLayer, backgroundLayer, canvas, toFollow

function updateCanvas() {
  const {entities, animations} = ecs
  const w = canvas.width, h = canvas.height
  const x = toFollow ? toFollow.x1 + (toFollow.x2 - toFollow.x1) / 2 : 0
  const y = toFollow ? toFollow.y1 + (toFollow.y2 - toFollow.y1) / 2 : 0
  const x1 = round(x - w / 2), y1 = round(y - h / 2)

  canvas.background(0)
  canvas.image(tileLayer, -x1, -y1)

  //display all
  for (let i = entities.length - 1; i >= 0; i--) {
    canvas.image(entities[i].getSprite(), round(entities[i].x - x1), round(entities[i].y - y1))
  }

  for (let i = animations.length - 1; i >= 0; i--) {
    canvas.image(animations[i].getSprite(), round(animations[i].x - x1), round(animations[i].y - y1))
  }

  const screenRation = width / height
  const {cameraMode, cameraRatio, cameraWidth, cameraHeight} = gameSettings
  let toW = width, toH = height, startX = 0, startY = 0
  if (cameraMode == 'auto') {
    if (screenRation > cameraRatio) { // wider
      toW = height * cameraRatio
      startX = (width - toW) / 2
    } else { //higher
      toH = width / cameraRatio
      startY = (height - toH) / 2
    }
    image(canvas, startX, startY, toW, toH)
  } else if (cameraMode == 'multiple') {
    if (screenRation > cameraRatio) { // wider
      toW = height * cameraRatio
    } else { //higher
      toH = width / cameraRatio
    }
    let multipleX = (toW - (toW % cameraWidth)) / cameraHeight
    let multipleY = (toH - (toH % cameraHeight)) / cameraHeight
    let multiple = multipleX < multipleY ? multipleX : multipleY
    toW = cameraWidth * multiple
    toH = cameraHeight * multiple
    startX = (width - toW) / 2
    startY = (height - toH) / 2
    image(canvas, round(startX), round(startY), round(toW), round(toH))
  }
}

function initCamera() {
  fritz.setup = () => {
    createCanvas(windowWidth, windowHeight)
    noSmooth()
    canvas = createGraphics()
    canvas.noSmooth()
    spriteLayer = createGraphics()
    spriteLayer.noSmooth()
    tileLayer = createGraphics()
    tileLayer.noSmooth()
    backgroundLayer = createGraphics()
    backgroundLayer.noSmooth()

    sizeCamera()
    start()
  }

  function sizeCamera() {
    const {cameraWidth, cameraHeight} = gameSettings

    canvas.size(cameraWidth, cameraHeight)
    spriteLayer.size(cameraWidth, cameraHeight)
    tileLayer.size(1000, 1000)
    backgroundLayer.size(cameraWidth * 2, cameraHeight * 2)
  }

  fritz.follow = entity => {
    console.log(entity);
    toFollow = entity
  }

  fritz.display = () => {
    console.warn('// TODO: display');
  }

  fritz.updateTileLayer = (tiles) => {
    const {w, h, s, graphicalMap} = fritz.maps
    if (tiles) {
      tiles.forEach(tile => {
        console.log(tile);
      })
    } else {
      const x1 = 0, y1 = 0, x2 = ceil(tileLayer.width / s), y2 = ceil(tileLayer.height / s)

      for (let x = x1; x < x2; x++) {
        for (let y = y1; y < y2; y++) {
          const i = xyi(x, y)
          const tile = i != -1 ? graphicalMap[i] : 0
          if (typeof tile == 'undefined') debugger
          tileLayer.image(fritz.sprites.tiles[tile], x * s, y * s, s, s)
        }
      }
    }
  }

  fritz.windowResized = () => {
    resizeCanvas(windowWidth, windowHeight);
  }
}

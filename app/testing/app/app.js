const functionToCallBeforeSetup = []
let preFunction = () => { }, postFunction = () => { }
let debugEnabled = false, createGameHasBeenCalled, currentStatus, statusNamespaces = {}

function reload() {
  resizeCamera()
}

function createGame(statusName, options) {
  if (statusNamespaces[statusName]) throw new Error('status already existing')

  const gameSettings = {type: 'pacman', levels: false, tileWidth: false, cameraMode: 'auto', cameraOverflow: 'hidden', cameraRatio: 0, cameraWidth: 0, cameraHeight: 0}
  setDefaultOptions(gameSettings, options)
  createGameHasBeenCalled = true

  setDefaultOptions(gameSettings, getCameraRatio(gameSettings))

  statusNamespaces[statusName] = {
    type: 'game',
    updateFunctions: [updateVariables, fixedUpdateECS, updateECS, redrawLayers],
    settings: gameSettings
  }
}

p5.prototype.registerMethod('init', () => {
  const setupCopy = window.setup || (() => { throw new Error('function setup is not defined') })
  const drawCopy = window.draw || (() => { })

  window.setup = () => {
    if (!createGameHasBeenCalled) throw new Error('Please use createGame to create a game :-)')
    p5.prototype.sprites.defaultTexture = createDefaultTexture()
    functionToCallBeforeSetup.forEach(fun => fun())
    setupCopy()
    startCamera()

    preFunction = () => {
      statusNamespaces[currentStatus].updateFunctions.forEach(fun => fun())
    }

    window.draw = drawCopy

    postFunction = () => { }
  }
  window.draw = () => { }
});

p5.prototype.registerMethod('pre', () => { preFunction() });
p5.prototype.registerMethod('post', () => { postFunction() });

const onStatusChangeCallbacks = {}, onStatusChangeDefaultCallbacks = {
  game: {
    pre: [() => {
      const {settings} = getNS()
      if (settings.type == 'pacman') {
        noSmooth()
        canvas.noSmooth()
        spriteLayer.noSmooth()
        tileLayer.noSmooth()
        layers = [tileLayer, spriteLayer]
      }
    }]
  },
  menu: {
    pre: [() => {
      smooth()
    }]
  }
}

p5.prototype.onStatusChange = (status, callback, type = 'pre') => {
  if (!onStatusChangeCallbacks[status]) onStatusChangeCallbacks[status] = {pre: [], post: []}
  onStatusChangeCallbacks[status][type].push(callback)
}

p5.prototype.changeStatus = newStatus => {
  let cdc = onStatusChangeDefaultCallbacks, cc = onStatusChangeCallbacks
  if (currentStatus) {
    let nS = getNS()
    if (cdc[nS.type] && cdc[nS.type].post) cdc[nS.type].post.forEach(fun => fun())
    if (cc[currentStatus]) cc[currentStatus].post.forEach(fun => fun())
  }
  currentStatus = newStatus
  nS = getNS()
  if (cdc[nS.type] && cdc[nS.type].pre) cdc[nS.type].pre.forEach(fun => fun())
  if (cc[currentStatus]) cc[currentStatus].pre.forEach(fun => fun())
  resizeCamera()
}

function getNS(status = currentStatus) {
  if (!statusNamespaces[status]) throw new Error(`invalid current status: ${status}`)
  return statusNamespaces[status]
}

function addDefaultOptions(settings, defaults) {
  for (let key in defaults) {
    if (typeof settings[key] == 'undefined') {
      settings[key] = defaults[key]
    }
  }
  return settings
}

function setDefaultOptions(defaults, settings) {
  for (let key in settings) {
    if (typeof defaults[key] != 'undefined') {
      defaults[key] = settings[key]
    } else {
      console.warn(`cannot change default settings, invalid key: ${key} of: `, settings);
    }
  }
  return defaults
}

function createDefaultTexture() {
  let g = createGraphics(16, 16)
  g.noStroke()
  g.fill(0)
  g.rect(0, 0, 8, 8)
  g.rect(8, 8, 16, 16)
  g.fill(255, 0, 255)
  g.rect(8, 0, 16, 8)
  g.rect(0, 8, 8, 16)
  return g
}

function getCameraRatio(settings) {

  let {cameraRatio, cameraWidth, cameraHeight} = settings
  if (cameraRatio && cameraWidth && cameraHeight && cameraHeight * cameraRatio == cameraWidth) return settings
  else if (!cameraRatio && cameraWidth && cameraHeight) cameraRatio = cameraWidth / cameraHeight
  else if (!cameraWidth && cameraRatio && cameraHeight) cameraWidth = cameraHeight * cameraRatio
  else if (!cameraHeight && cameraWidth && cameraRatio) cameraHeight = cameraWidth / cameraRatio
  else if (!cameraHeight && !cameraWidth && cameraRatio) {
    const {width, height} = window.screen
    if (width / height == cameraRatio) { cameraWidth = width, cameraHeight = height }
    else if (width / height > cameraRatio) { cameraWidth = height * cameraRatio, cameraHeight = height }
    else { cameraWidth = width, cameraHeight = width / cameraHeight }
  } else throw new Error(`unable to crete camera, not enough parameters specified, minimun 2 (cameraRatio, cameraWidth, cameraHeight)`)
  return {cameraRatio: cameraRatio, cameraWidth: cameraWidth, cameraHeight: cameraHeight}
}

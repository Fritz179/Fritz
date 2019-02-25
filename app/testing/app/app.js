const gameSettings = {type: 'pacman', levels: false, tileWidth: false, cameraMode: 'auto', cameraOverflow: 'hidden', cameraRatio: 0, cameraWidth: 0, cameraHeight: 0}
const functionToCallBeforeSetup = []
let preFunction = () => { }
let postFunction = () => { }
let debugEnabled = true, createGameHasBeenCalled

function createGame(options) {
  setDefaultOptions(gameSettings, options)
  if (createGameHasBeenCalled) throw new Error('An existing game instance already exist')
  createGameHasBeenCalled = true

  let {cameraRatio, cameraWidth, cameraHeight} = gameSettings
  if (!cameraRatio && cameraWidth && cameraHeight) gameSettings.cameraRatio = cameraWidth / cameraHeight
  else if (!cameraWidth && cameraRatio && cameraHeight) gameSettings.cameraWidth = cameraHeight * cameraRatio
  else if (!cameraHeight && cameraWidth && cameraRatio) gameSettings.cameraHeight = cameraWidth / cameraRatio
  else throw new Error(`unable to crete camera, not enough parameters specified, minimun 2 (cameraRatio, cameraWidth, cameraHeight)`)
}

p5.prototype.registerMethod('init', () => {
  const setupCopy = window.setup || (() => { throw new Error('function setup is not defined') })
  const drawCopy = window.draw || (() => { })

  window.setup = () => {
    if (!createGameHasBeenCalled) throw new Error('Please use createGame to create a game :-)')
    functionToCallBeforeSetup.forEach(fun => fun())
    setupCopy()
    startCamera()

    preFunction = () => {
      fixedUpdateECS()
      updateECS()
      redrawLayers()
    }

    window.draw = drawCopy

    postFunction = () => { }
  }
  window.draw = () => { }
});

p5.prototype.registerMethod('pre', () => { preFunction() });
p5.prototype.registerMethod('post', () => { postFunction() });

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

function xyi(x, y) {
  const {w, h} = p5.prototype.maps
  if (x >= w || x < 0 || y >= h || y < 0) return -1
  return y * w + x
}

function ixy(i) {
  const {w, h} = p5.prototype.maps
  if (i > w * h || i < 0) return {x: -1, y: -1}
  return {x: i % w, y: (i - (i % w)) / h}
}

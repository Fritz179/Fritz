let _preFunction = () => { }, _postFunction = () => { }, preStatusUpdate = new Set(), postStatusUpdate = new Set()
let debugEnabled = false, status, currentStatus, statuses = {}, resizingCamera = true

function reload() {
  console.warn('reloading!');
  status.camera.resize()
}

p5.prototype.registerMethod('init', () => {
  console.log('init');
  const setupCopy = window.setup || (() => { throw new Error('function setup is not defined') })
  const drawCopy = window.draw || (() => { })

  window.setup = () => {
    p5.prototype.sprites.defaultTexture = createDefaultTexture()
    createCanvas(windowWidth, windowHeight).parent('screen');
    setupCopy()

    _preFunction = () => {
      if (resizingCamera) return resizingCamera = false

      preStatusUpdate.forEach(fun => fun())
      status._update()
      postStatusUpdate.forEach(fun => fun())
    }

    window.draw = drawCopy

    _postFunction = () => { }
  }
  window.draw = () => { }
});

p5.prototype.registerMethod('pre', () => { _preFunction() });
p5.prototype.registerMethod('post', () => { _postFunction() });

p5.prototype.createStatus = (statusName, init) => {
  if (statuses[statusName]) throw new Error(`Status ${statusName} already exists!`)

  status = statuses[statusName] = new Status(statusName)
  init(status)
};

p5.prototype.setCurrentStatus = (newStatus, ...args) => {
  if (!statuses[newStatus]) throw new Error(`Invalid Status: ${newStatus}`)

  function oneTime() {
    if (status) status._post(...args)

    status = statuses[currentStatus = newStatus]

    status._pre(...args)
    if (status.cameraEnabled) status.camera.resize()

    preStatusUpdate.delete(oneTime)
  }

  preStatusUpdate.add(oneTime)
}

window.windowResized = () => { if (status && status.cameraEnabled) status.camera.resize() }

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
  let {ratio, cameraWidth, cameraHeight} = settings
  if (ratio && cameraWidth && cameraHeight && cameraHeight * ratio == cameraWidth) return settings
  else if (!ratio && cameraWidth && cameraHeight) ratio = cameraWidth / cameraHeight
  else if (!cameraWidth && ratio && cameraHeight) cameraWidth = cameraHeight * ratio
  else if (!cameraHeight && cameraWidth && ratio) cameraHeight = cameraWidth / ratio
  else if (!cameraHeight && !cameraWidth && ratio) {
    const {width, height} = window.screen
    if (width / height == ratio) { cameraWidth = width, cameraHeight = height }
    else if (width / height > ratio) { cameraWidth = height * ratio, cameraHeight = height }
    else { cameraWidth = width, cameraHeight = width / cameraHeight }
  } else throw new Error(`unable to crete camera, not enough parameters specified, minimun 2 (ratio, cameraWidth, cameraHeight)`)
  return {ratio: ratio, cameraWidth: cameraWidth, cameraHeight: cameraHeight}
}

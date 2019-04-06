let _preFunction = () => { }, _postFunction = () => { }, preStatusUpdate = new Set(), postStatusUpdate = new Set()
let debugEnabled = false, status, currentStatus, statuses = {}, resizingCamera = true

function reload() {
  console.warn('reloading!');
  status.camera.resize()
}

//init => called after p5 constructor and before preload
p5.prototype.registerMethod('init', () => {
  console.log('init');
  //keep a reference to the users function
  const setupCopy = window.setup || (() => { throw new Error('function setup is not defined') })
  const drawCopy = window.draw || (() => { })

  //modify setup function
  window.setup = () => {
    p5.prototype.sprites.defaultTexture = createDefaultTexture()
    createCanvas(windowWidth, windowHeight).parent('screen');

    //call users setup
    setupCopy()

    //set function to be always called before draw
    _preFunction = () => {
      if (resizingCamera) return resizingCamera = false

      preStatusUpdate.forEach(fun => fun())
      status._fixedUpdate()
      status._update()

      background(debugEnabled ? 51 : 0)
      image(status.getSprite(), status.x, status.y)

      postStatusUpdate.forEach(fun => fun())
    }

    //restore draw function
    window.draw = drawCopy

    _postFunction = () => { }
  }

  //clear draw function, else is called in creteCanvas and setup is not finished
  window.draw = () => { }
});

//pre => called always before draw, post => after draw
p5.prototype.registerMethod('pre', () => { _preFunction() });
p5.prototype.registerMethod('post', () => { _postFunction() });

p5.prototype.createStatus = (statusName, Constructor, options) => {
  //(Constructor, [options])
  if (typeof statusName == 'function') return p5.prototype.createStatus(deCapitalize(statusName.name), statusName, Constructor)
  if (statuses[statusName]) throw new Error(`Status ${statusName} already exists!`)

  //(statusName, [options])
  if (typeof Constructor != 'function') return p5.prototype.createStatus(statusName, Menu, Constructor)

  //check if it extends Status
  if (!(Constructor.prototype instanceof Status)) throw new Error(`${statusName} is not a instanceof Status: ${Constructor}`)
  return statuses[statusName] = new Constructor(options)
};

p5.prototype.setCurrentStatus = (newStatus, ...args) => {
  //check if the new status exist
  if (!statuses[newStatus]) throw new Error(`Invalid Status: ${newStatus}`)

  //create a function that runs only one time before the next statusUpdate
  //if status is swapped while updating another status, for the rest of the update status points to the new status
  function oneTime() {
    //if there was a previous status, false only on first setCurrentStatus
    if (status) {
      status._post(...args)
      p5.prototype.removeAllListeners()
    }

    //hot-swap
    status = statuses[currentStatus = newStatus]

    status._pre(...args)
    status.camera.resize()

    //remove the function once it has been called
    preStatusUpdate.delete(oneTime)
  }

  preStatusUpdate.add(oneTime)
}

//resize camera of current status if window is resized
window.windowResized = () => { if (status) status.camera.resize() }

//helper function, like object.assign but assign only if undefined in target
function addDefaultOptions(target, source) {
  for (let key in source) {
    if (typeof target[key] == 'undefined') {
      target[key] = source[key]
    }
  }
  return target
}

//helper function, like
function setDefaultOptions(target, source) {
  console.log('setDefaultOptions called!!');
  for (let key in source) {
    if (typeof target[key] != 'undefined') {
      target[key] = source[key]
    } else {
      console.warn(`cannot change default source, invalid key: ${key} of: `, source);
    }
  }
  return target
}

function deCapitalize(string) {
    return string.charAt(0).toLowerCase() + string.slice(1);
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

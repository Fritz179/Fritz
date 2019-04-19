let _preFunction = () => { }, _postFunction = () => { }, preStatusUpdate = new Set(), postStatusUpdate = new Set()
let debugEnabled = false, status, currentStatus, statuses = {}, resizingCamera = true
let masterStatus

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

    masterStatus = new MasterStatus()

    //call users setup
    setupCopy()

    //set function to be always called before draw
    _preFunction = () => {
      if (resizingCamera) return resizingCamera = false

      preStatusUpdate.forEach(fun => fun())
      status._fixedUpdate()
      status._update()

      background(debugEnabled ? 51 : 0)
      image(masterStatus.getSprite(x => x, y => y), 0, 0)

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

//resize camera of current status if window is resized
window.windowResized = () => {
  resizeCanvas(windowWidth, windowHeight);
  masterStatus.setSize(windowWidth, windowHeight)
}

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
  g.noSmooth()
  g.noStroke()
  g.fill(0)
  g.rect(0, 0, 8, 8)
  g.rect(8, 8, 16, 16)
  g.fill(255, 0, 255)
  g.rect(8, 0, 16, 8)
  g.rect(0, 8, 8, 16)
  return g
}

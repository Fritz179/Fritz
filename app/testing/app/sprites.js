// load an image an parse image with an encoding type or with a custom function,
// encoding type is specified in the json file (typically located in the same folder with same file name)
// if the mirror key is set to true, the image will be parsed and saved with a left and righ variant
//
// encoding types available:
// animations => varius named animations, usufull for multi-actions entity, mirror available if needed
// pacman => loads in sprites to create a map pacman_like tile based game, block construction

p5.prototype.sprites = {}
p5.prototype.loadSpriteSheet = (name, options = {}, callback) => {
  addDefaultOptions(options, {path: './img', format: 'png', json: true})
  const ret = {}

  loadImage(options.src || `.${options.path}/${name}.${options.format}`, img => {
    //load image, if no json is specified available just save the image
    let sprite
    if (!options.json) {
      if (options.customSpriteSheetParser) {
        sprite = options.customSpriteSheetParser(img, json)
      } else {
        sprite = parseSpriteSheet(img, false, options)
      }
      callback ? callback(sprite) : p5.prototype.sprites[name] = sprite
      return
    }

    //get json and parse it
    loadJSON(options.jsonPath || `.${options.path}/${name}.json`, json => {
      //if no custom function is available parse it
      if (options.customSpriteSheetParser) {
        sprite = customSpriteSheetParser(img, json)
      } else {
        sprite = parseSpriteSheet(img, json, options)
      }
      callback ? callback(sprite) : p5.prototype.sprites[name] = sprite
    }, e => {
      console.log(e);
      throw new Error(`Error json loading: ${name} at: `)
    })
  }, (e) => {
    //if image failed to load, throw an error
    console.log(e);
    throw new Error(`Error loading image at: ${e.path[0].src}`);
  })

  return ret;
};

p5.prototype.registerPreloadMethod('loadSpriteSheet', p5.prototype.loadSpriteSheet);

function parseSpriteSheet(img, json, options) {
  if (gameSettings.type == 'pacman') {
    if (!json) {
      if (options.type == 'tiles') return parsePacmanTiles(img)
      else if (!json) return img
      else throw new Error('Invalid arguments')
    } else {
      if (json.animations) return parseAnimation(img, json)
    }
  }
  console.log(img, json);
}

function parsePacmanTiles(img) {
  const l = 0

  const w = h = img.height

  const sprite = []
  sprite.tilePieces = {
    corner: cut(img, 0, 0, w, h),
    junction: flipH(cut(img, w, 0, w, h)),
    junctionRotated: unRotate(cut(img, w, 0, w, h)),
    straightLeft: cut(img, w * 2, 0, w, h),
    straightRight: unRotate(cut(img, w * 3, 0, w, h)),
    outer: cut(img, w * 4, 0, w, h),
    empty: cut(img, w * 5, 0, w, h),
    converter: {},
    add: tile => {
      if (typeof sprite.tilePieces.converter[tile] == 'undefined') {
        // console.log(sprite.length, tile);
        sprite.tilePieces.converter[tile] = sprite.length
        sprite[sprite.length] = compose(tile.split('_'), w, h)
      }
    }
  }

  sprite.tilePieces.add('empty_empty_empty_empty')

  function compose(pieces, w, h) {7
    let g =  createGraphics(w * 2, h * 2)
    g.image(sprite.tilePieces[pieces[0]], 0, 0, w, h)
    g.image(rotate90(sprite.tilePieces[pieces[1]]), w, 0, w, h)
    g.image(rotate90(rotate90(sprite.tilePieces[pieces[2]])), w, h, w, h)
    g.image(unRotate(sprite.tilePieces[pieces[3]]), 0, h, w, h)
    return g
  }

  return sprite
}

function parseAnimation(img, json) {
  const sprite = {}
  json.animations.forEach(animation => {
    const {x, y, w, h, action, xOff = 0, yOff = 0, mirror = json.mirror || false, ultraMirror = json.ultraMirror || false} = animation
    sprite[action] = []

    if (animation.recursive) {
      const wrap = img.width

      //once defaults are setted, loop through animation
      for (let i = 0; i < animation.recursive; i++) {
        sprite[action][i] = []
        let x1 = (x + w * i) % wrap
        let y1 = y + h * Math.floor((x + w * i) / wrap)
        if (!Number.isInteger(x1) || !Number.isInteger(y1) || !action) throw new Error(`invalid arguments for ${name} sprite`)
        if (ultraMirror) {
          sprite[action][i][0] = cut(img, x1, y1, w, h)
          sprite[action][i][1] = rotate90(cut(img, x1, y1, w, h))
          sprite[action][i][2] = rotate90(rotate90(cut(img, x1, y1, w, h)))
          sprite[action][i][3] = unRotate(cut(img, x1, y1, w, h))
        } else if (mirror) {
          sprite[action][i][0] = cut(img, x1, y1, w, h)
          sprite[action][i][1] = flipH(cut(img, x1, y1, w, h))
        } else {
          sprite[action][i] = cut(img, x1, y1, w, h)
        }
      }
    } else {
      if (ultraMirror) {
        sprite[action][0] = cut(img, x, y, w, h)
        sprite[action][1] = rotate90(cut(img, x, y, w, h))
        sprite[action][2] = rotate90(rotate90(cut(img, x, y, w, h)))
        sprite[action][3] = unRotate(cut(img, x, y, w, h))
      } else if (mirror) {
        sprite[action][0] = cut(img, x, y, w, h)
        sprite[action][1] = flipH(cut(img, x, y, w, h))
      } else {
        sprite[action] = cut(img, x, y, w, h)
      }
    }
  })

  return sprite
}

function cut(img, x, y, w, h) {
  let g = createGraphics(w, h)
  g.noSmooth()
  g.image(img, 0, 0, w, h, x, y, w, h)
  return g
}

function rotate90(img) {
  const w = img.width, h = img.height
  let g = createGraphics(h, w)
  g.noSmooth()
  g.rotate(HALF_PI)
  g.image(img, 0, -h, w, h, 0, 0, w, h)
  return g
}

function unRotate(img) {
  const w = img.width, h = img.height
  let g = createGraphics(h, w)
  g.noSmooth()
  g.rotate(-HALF_PI)
  g.image(img, -w, 0, w, h, 0, 0, w, h)
  return g
}

function flipH(img) {
  const w = img.width, h = img.height
  let g = createGraphics(w, h)
  g.noSmooth()
  g.scale(-1, 1)
  g.image(img, -w, 0, w, h, 0, 0, w, h)
  return g
}

function flipV(img) {
  const w = img.width, h = img.height
  let g = createGraphics(w, h)
  g.noSmooth()
  g.scale(1, -1)
  g.image(img, 0, -h, w, h, 0, 0, w, h)
  return g
}

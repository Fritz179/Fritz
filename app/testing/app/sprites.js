function initSprites() {
  fritz.sprites = {}

  fritz.setDefaultSpriteSheetOptions = settings => {
    setDefaultOptions(defaultOptions.addSpriteSheet, settings)
  }

  //load an image an parse image with an encoding type or with a custom function,
  //encoding type is specified in the json file (typically located in the same folder with same file name)
  //if the mirror key is set to true, the image will be parsed and saved with a left and righ variant

  //encoding types available:
  //animations => varius named animations, usufull for multi-actions entity, mirror available if needed
  //pacman => loads in sprites to create a map pacman_like tile based game, block construction
  fritz.addSpriteSheet = (name, options = {}, customSpriteSheetParser) => {
    addDefaultOptions(options, defaultOptions.addSpriteSheet)

    loadImage(options.src || `.${options.path}/${name}.${options.format}`, img => {
      //load image, if no json is specified available just save the image
      if (!options.json) {
        fritz.sprites[name] = img
      } else {
        loadJSON(typeof options.json == 'string' ? options.json : `.${options.path}/${name}.json`, json => {
          if (customSpriteSheetParser) {
            fritz.sprites[name] = customSpriteSheetParser(img, json)
            return
          }
          if (typeof json.encoding != 'string') throw new Error(`encoding not specified of ${name}`)

          //if no custom function is available and there is an encoding key, parse the image
          if (typeof spriteSheetParsers[json.encoding] == 'function') {
            spriteSheetParsers[json.encoding](name, img, json)
          } else {
            console.warn('supported encoding methods: animations, pacman. For more info take a look at the README')
            throw new Error(`the ${json.encoding} encoding method not supported!`)
          }
        })
      }
    }, (e) => {
      //if image failed to load, throw an error
      console.log(e);
      throw new Error(`Error loading image at: ${e.path[0].src}`);
    })
  }

  const spriteSheetParsers = {
    animations: (name, img, json) => {
      if (!json.animations) throw new Error(`No animations key for ${name} sprite`)
      const {cut, flipH} = spriteSheetParsers

      fritz.sprites[name] = {}
      json.animations.forEach(animation => {
        const {x, y, w, h, action, xOff = 0, yOff = 0, mirror = json.mirror || false} = animation
        if (animation.recursive) {
          const wrap = img.width
          if (mirror) {
            fritz.sprites[name][`${action}_right`] = []
            fritz.sprites[name][`${action}_left`] = []
          } else {
            fritz.sprites[name][action] = []
          }

          //once defaults are setted, loop through animation
          for (let i = 0; i < animation.recursive; i++) {
            let x1 = (x + w * i) % wrap
            let y1 = y + h * Math.floor((x + w * i) / wrap)
            if (!Number.isInteger(x1) || !Number.isInteger(y1) || !action) throw new Error(`invalid arguments for ${name} sprite`)
            if (mirror) {
              fritz.sprites[name][`${action}_right`][i] = cut(img, x1, y1, w, h)
              fritz.sprites[name][`${action}_left`][i] = flipH(cut(img, x1, y1, w, h))
            } else {
              fritz.sprites[name][action][i] = cut(img, x1, y1, w, h)
            }
          }
        } else {
          if (mirror) {
            fritz.sprites[name][`${action}_right`] = cut(img, x, y, w, h)
            fritz.sprites[name][`${action}_left`] = flipH(cut(img, x, y, w, h))
          } else {
            fritz.sprites[name][action] = cut(img, x, y, w, h)
          }
        }
      })
    },

    pacman: (name, img, json) => {
      const l = 0
      const {cut, rotate, unRotate, flipH} = spriteSheetParsers
      const w = json.w / 2, h = json.h / 2

      const sprite = fritz.sprites[name] = []
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

      function compose(pieces, w, h) {
        const {rotate, unRotate} = spriteSheetParsers
        let g =  createGraphics(w * 2, h * 2)
        g.image(sprite.tilePieces[pieces[0]], 0, 0, w, h)
        g.image(rotate(sprite.tilePieces[pieces[1]]), w, 0, w, h)
        g.image(rotate(rotate(sprite.tilePieces[pieces[2]])), w, h, w, h)
        g.image(unRotate(sprite.tilePieces[pieces[3]]), 0, h, w, h)
        return g
      }
    },

    cut: (img, x, y, w, h) => {
      let g = createGraphics(w, h)
      g.noSmooth()
      g.image(img, 0, 0, w, h, x, y, w, h)
      return g
    },

    rotate: img => {
      const w = img.width, h = img.height
      let g = createGraphics(h, w)
      g.noSmooth()
      g.rotate(HALF_PI)
      g.image(img, 0, -h, w, h, 0, 0, w, h)
      return g
    },

    unRotate: img => {
      const w = img.width, h = img.height
      let g = createGraphics(h, w)
      g.noSmooth()
      g.rotate(-HALF_PI)
      g.image(img, -w, 0, w, h, 0, 0, w, h)
      return g
    },

    flipH: img => {
      const w = img.width, h = img.height
      let g = createGraphics(w, h)
      g.noSmooth()
      g.scale(-1, 1)
      g.image(img, -w, 0, w, h, 0, 0, w, h)
      return g
    },

    flipV: img => {
      const w = img.width, h = img.height
      let g = createGraphics(w, h)
      g.noSmooth()
      g.scale(1, -1)
      g.image(img, 0, -h, w, h, 0, 0, w, h)
      return g
    },
  }

  fritz.display = (img, x, y) => {
    image(img, x, y)
  }
}

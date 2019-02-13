(function IIFE(window) {
  'use strict'

    function generateFritz() {
      const fritz = Object.create(null)

      const defaultOptions = {
        addSpriteSheet: {path: '/img', format:'png', json: true},
        loadMap: {path: '/levels'},
        createPool: {}
      }

        //////////////////
       //// Sprites ////
      ////////////////

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
                console.log(sprite.length, tile);
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

        ////////////////////////
       //// game settings ////
      //////////////////////

      const gameSettings = {
        mode: 'arcade', //arcade, endless_runner, space
        gravity: 0.1
      }

      fritz.createGame = (options = {}) => {
        for (var key in gameSettings) {
          gameSettings[key] = options[key] || gameSettings[key]
        }
      }

        /////////////
       //// map ////
      /////////////

      fritz.maps = {
        tileMap: [],
        collisionMap: [],
        graphicalMap: [],
        w: 0,
        h: 0
      }

      fritz.setDefaultLoadMapOptions = settings => {
        setDefaultOptions(defaultOptions.loadMap, settings)
      }

      //load a map and parse it if required

      //encoding types available:
      //parsed => tileMap already available, create graphicalMap map and collisionMap
      //pacman => loads in sprites to create a map pacman-like tile based game, block construction
      fritz.loadMap = (name, options = {}, customMapParser) => {
        addDefaultOptions(options, defaultOptions.loadMap)

        loadJSON(options.src || `.${options.path}/${name}.json`, json => {
          if (customMapParser) {
            fritz.maps = customMapParser(json)
            return
          }
          if (typeof json.encoding != 'string') throw new Error(`encoding not specified of ${name}`)

          //if no custom function is available and there is an encoding key, parse the image
          if (typeof mapParsers[json.encoding] == 'function') {
            mapParsers[json.encoding](json)
          } else {
            console.warn('supported encoding methods: pacman, parsed. For more info take a look at the README')
            throw new Error(`the ${json.encoding} encoding method not supported!`)
          }
        }, (e) => {
          //if json failed to load, throw an error
          console.log(e);
          throw new Error(`Error loading json at: ${e.path[0].src}`);
        })
      }

      const mapParsers = {
        //if the json contains rect, parse them
        createMap: json => {

        },

        parsed: json => {
          //check if valid json
          if (!json.map) throw new Error('Missing map key')
          if (!json.w) throw new Error('Map not parsed correctly, missin width')
          if (!Number.isInteger(json.map.length / json.w)) throw new Error('invalid width, not complete row')
          if (!json.h) json.h = json.map.length / json.w

          console.log(json.map);
        },

        pacman: json => {
          const {getSize, fillMap, fillOffsets, setUndefined} = mapParsers
          const innerTile = 0, wallTile = 1, outerTile = 2
          const tileMap = []

          //find map size
          const {w, h, j} = getSize(json)
          fritz.maps.w = tileMap.w = w
          fritz.maps.h = tileMap.h = h
          fritz.maps.j = tileMap.j = j


          //get throug shapes and init empty spaces as innerTile
          fillMap(tileMap, json, innerTile)

          //loop through current map and set border as wallTile
          fillOffsets(tileMap, [-w - 1, -w, -w + 1, -1, 1, w - 1, w, w + 1], innerTile, wallTile)

          //loop through map and set everithing else as outerTile
          setUndefined(tileMap, j, outerTile)

          //start creating graphicalMap
          const graphicalMap = []

          //check tile for tile
          tileMap.forEach((tile, i) => {
            if (tile == 1) {
              const l = i % w == 0
              const r = i % w == w - 1
              const offsets = [l ? 0 : -w - 1, -w, r ? 0 : -w + 1, l ? 0 : -1, r ? 0 : 1, l ? 0 : w - 1, w, r ? 0 : w + 1].map(offset => {
                return (typeof tileMap[i + offset] != 'undefined' && offset != 0) ? tileMap[i + offset] : outerTile
              })

              graphicalMap[i] = fritz.sprites.tiles.tilePieces.converter[getPacman(...offsets)]
            } else {
              graphicalMap[i] = 0
            }
          })

          console.log(tileMap);
          console.log(graphicalMap);
          graphicalMap.forEach((tile, i) => {
            const x = i % w
            const y = (i - x) / w
            const s = 16
            image(fritz.sprites.tiles[tile], x * s, y * s)
          })


          function getPacman(tl, t, tr, l, r, bl, b, br) {
            let tile = []

            getCorner(tl, t, tr, l, r, bl, b, br, 0)
            function getCorner(tl, t, tr, l, r, bl, b, br, depth) {
              if (depth > 3) {
                return
              }

              if (t == 0) {
                if (l == 0) {
                  tile.push('corner')
                } else if (r == 0) {
                  tile.push('junction')
                } else {
                  tile.push('straightLeft')
                }
              } else {
                if (l == 0) {
                  if (b == 0) {
                    tile.push('junctionRotated')
                  } else {
                    tile.push('straightRight')
                  }
                } else {
                  if (tl == 0) {
                    tile.push('outer')
                  } else {
                    tile.push('empty')
                  }
                }
              }
              getCorner(tr, r, br, t, b, tl, l, bl, depth + 1)
            }

            tile = tile.join('_')
            fritz.sprites.tiles.tilePieces.add(tile)

            return tile
          }

        },

        fillMap: (tileMap, json, toFill) => {
          if (json.rect) {
            json.rect.forEach(rect => {
              const [x1, y1, x2, y2] = rect
              for (let x = x1; x <= x2; x++) {
                for (let y = y1; y <= y2; y++) {
                  tileMap[y * tileMap.w + x] = toFill
                }
              }
            })
          }
        },

        fillOffsets: (tileMap, offsets, toCheck, replace) => {
          tileMap.forEach((tile, i) => {
            if (tile == toCheck) {
              offsets.forEach(offset => {
                if (typeof tileMap[i + offset] == 'undefined' && i + offset <= tileMap.j && i + offset >= 0) {
                  tileMap[i + offset] = replace
                }
              })
            }
          })
        },

        getSize: json => {
          let ws = 99, hs = 99, we = 0, he = 0
          if (json.rect) {
            json.rect.forEach(rect => {
              const [x1, y1, x2, y2] = rect
              ws = x1 < ws ? x1 : ws
              hs = y1 < hs ? y1 : hs
              we = x2 > we ? x2 : we
              he = y2 > he ? y2 : he
            })
          }

          //set map size
          if (ws != 1 || hs != 1) throw new Error(`invalid map, nullpunkt invalid, ${ws}${hs}`)

          const w = we + 2, h = he + 2
          return {w: w, h: h, j: w * h}
        },

        setUndefined: (tileMap, j, tile) => {
          for (let i = 0; i < j; i++) {
            if (typeof tileMap[i] == 'undefined') {
              tileMap[i] = tile
            }
          }
        }
      }

        ////////////////
       //// camera ////
      ////////////////

      fritz.display = (img, x, y) => {
        image(img, x, y)
      }


        //////////////////
       //// Entities ////
      //////////////////

      class Master {
        constructor() {
          this.x = 0
          this.y = 0
          this.w = 16
          this.h = 16
        }

        setPos(x, y) {
          this.x = x
          this.y = y
        }

        setSize(w, h) {
          this.w = w
          this.h = h
        }

        get x1() { return this.x }
        get y1() { return this.y }
        get x2() { return this.x + this.w }
        get y2() { return this.y + this.h }

        set x1(x) { this.x = x }
        set y1(y) { this.y = y }
        set x2(x) { this.x = x - this.w }
        set y2(y) { this.y = y - this.h }

      }

      class Animation extends Master {
        constructor(sprite) {
          super()

          this.sprite = sprite || createDefaultTexture()
          this._class = 'Animation'
        }

        display() {

        }

        setSprite(sprite) {
          this.sprite = sprite
        }
      }

      class Hitbox extends Animation {
        constructor() {
          super()

          this.tag = 'Hitbox'
          this._class = 'Hitbox'
        }

        onCollisionEntry() {
          console.error(`${this.tag}, hitbox without onCollisionEntry`)
        }
      }

      class Entity extends Master {
        constructor() {
          super()

          this.tag = 'Entity'
          this.sprite = createDefaultTexture()
          this._class = 'Entity'
        }

        onCollisionEntry() {
          console.error(`${this.tag}, entity without onCollisionEntry`)
        }

        onHitboxEntry() {

        }

        display() {

        }

        setSprite(sprite) {
          this.sprite = sprite
        }
      }

      fritz.Animation = Animation
      fritz.Hitbox = Hitbox
      fritz.Entity = Entity

      const spawners = {}
      const pools = {}

      fritz.createSpawner = (key, constructor) => {
        if (!spawners[key]) {
          spawners[key] = constructor
        } else {
          throw new Error(`Spawner named: ${key} already exists!`)
        }
      }

      fritz.createPool = (key, constructor, options) => {
        if (pools[key]) {
          throw new Error(`Pool named: ${key} already exists!`)
        }

        addDefaultOptions(options, defaultOptions.createPool)

        const pool = pools[key] = {
          constructor: constructor,
          active: [],
          inactive: [],
        }

        for (let i = 0; i < options.max; i++) {
          pool.inactive = new constructor()
        }

        return {
          get: () => {
            if (pool.inactive.length) {
              return pool.inactive.splice(0, 1)
            } else if (options.overflow != 'stop') {
              if (options.overflow == 'last') {
                return pool.active.splice(0, 1)
              } else if (options.overflow == 'create') {
                return new constructor()
              }
            }
          }
        }
      }

        ////////////////////
       //// collisions ////
      ////////////////////

      fritz.collideMapX = entity => {

      }

      fritz.collideMapY = entity => {

      }

      fritz.rect_overlaps_rect = (a, b) => {
        return a.x1 < b.x2 && a.x2 > b.x1 && a.y1 < b.y2 && a.y2 > b.y1
      }

      fritz.circle_averlaps_circle = (a, b) => {
        const r = a.r + b.r
        const x = a.x + b.x
        const y = a.y + b.y
        return r * r < x * x + y * y
      }

      fritz.rect_solve_rect = (a, b) => {

      }


      return fritz
    }

      ///////////////////////////
     //// helper functions ////
    /////////////////////////

    function addDefaultOptions(settings, defaults) {
      for (let key in defaults) {
        if (typeof settings[key] == 'undefined') {
          settings[key] = defaults[key]
        }
      }
    }

    function setDefaultOptions(defaults, settings) {
      for (let key in settings) {
        if (typeof defaults[key] != 'undefined') {
          defaults[key] = settings[key]
        } else {
          console.warn(`cannot change default settings, invalid key: ${key} of: ${settings}`);
        }
      }
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

    if (!window._fritzAppVersion) {
      window._fritzAppVersion = 1

      const fritzs = [generateFritz, generateSprites].forEach(fritz => {
        addToWindowFriendly(fritz())
      })

      function addToWindowFriendly(fritz) {
        console.log(fritz);
        for (var key in fritz) {
          if (typeof window[key] == 'undefined') {
            window[key] = fritz[key]
          } else {
            console.log(`in window ${key} is already defined`);
          }
        }
      }
    } else {
      console.warn('FritzApp already available');
    }
})(window);

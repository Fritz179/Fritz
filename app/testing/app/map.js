const collideTop = 0x1
const collideRight = 0x2
const collideBottom = 0x4
const collideLeft = 0x8

function initMap() {
  fritz.maps = {
    tileMap: [],
    collisionMap: [],
    graphicalMap: [],
    w: 0,
    h: 0,
    s: 0
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
      const {tileMap} = fritz.maps

      //find map size
      const {w, h} = getSize(json)
      fritz.maps.w = tileMap.w = w
      fritz.maps.h = tileMap.h = h

      //get throug shapes and init empty spaces as innerTile
      fillMap(tileMap, json, innerTile)

      //loop through current map and set border as wallTile
      fillOffsets(tileMap, [-w - 1, -w, -w + 1, -1, 1, w - 1, w, w + 1], innerTile, wallTile)

      //loop through map and set everithing else as outerTile
      setUndefined(tileMap, w * h, outerTile)

      //start creating graphicalMap
      const {graphicalMap} = fritz.maps

      //check tile for tile to create graphicalMap
      tileMap.forEach((tile, i) => {
        if (tile == wallTile) {
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

      //start creating collisionMap
      const {collisionMap} = fritz.maps

      //check tile for tile to create collisionMap
      tileMap.forEach((tile, i) => {
        let collsion = 0

        if (tile == wallTile) {
          if (tileMap[i - w] == innerTile) collsion += collideTop
          if (tileMap[i - 1] == innerTile) collsion += collideLeft
          if (tileMap[i + 1] == innerTile) collsion += collideRight
          if (tileMap[i + w] == innerTile) collsion += collideBottom
        }

        collisionMap[i] = collsion
      })


      console.log(fritz.maps);

      fritz.updateTileLayer()

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
      const j = tileMap.w * tileMap.h
      tileMap.forEach((tile, i) => {
        if (tile == toCheck) {
          offsets.forEach(offset => {
            if (typeof tileMap[i + offset] == 'undefined' && i + offset <= j && i + offset >= 0) {
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
      return {w: w, h: h}
    },

    setUndefined: (tileMap, j, tile) => {
      for (let i = 0; i < j; i++) {
        if (typeof tileMap[i] == 'undefined') {
          tileMap[i] = tile
        }
      }
    }
  }
}

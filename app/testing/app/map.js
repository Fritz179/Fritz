p5.prototype.flags = {
  collideTop: 0x1,
  collideRight: 0x2,
  collideBottom: 0x4,
  collideLeft: 0x8
}
// p5.prototype.mapsSaved = {}
const originalMapJson = {}

//encoding types available:
//pacman => loads in sprites to create a map pacman-like tile based game, block construction

p5.prototype.loadMap = (name, options = {}, callback) => {
  addDefaultOptions(options, {path: '/levels'})
  const ret = {}

  if (originalMapJson[name]) console.warn(`Map already loaded: ${name}`);
  else {
    //load map and save it
    loadJSON(options.src || `.${options.path}/${name}.json`, json => {
      addDefaultOptions(json, {name: name})
      originalMapJson[name] = json
      if (typeof callback == 'function') callback()
    }, e => {
      console.log(e);
      throw new Error(`Error loading json: ${name} at: `)
    })
  }

  return ret;
};

p5.prototype.registerPreloadMethod('loadMap', p5.prototype.loadMap);

class Maps {
  constructor(settings) {
    this.tileMap = []
    this.collisionMap = []
    this.graphicalMap = []
    this.w = this.h = 0
    this.s = 16
    this.type = 'arcade'
    this.settings(settings)
  }

  setMap(name, options = {}) {
    console.log('setMap', name, options);
    const {map, getOriginal, namespace} = options
    if (map) this._setMap(map)
    // else if (!getOriginal && p5.prototype.mapsSaved[name]) this._setMap(p5.prototype.mapsSaved[name])
    else if (originalMapJson[name]) this._setMap(parseMap(originalMapJson[name], this.type))
    else throw new Error(`Invalid map name: ${name}`)
  }

  _setMap(maps) {
    if (maps.name == this.name) console.warn(`Relaoding map: ${maps.name}`);

    const neededKeys = ['tileMap', 'collisionMap', 'graphicalMap', 'w', 'h', 'name'].forEach(key => {
      if (!maps[key]) throw new Error(`missing ${key} property on map`)
      this[key] = maps[key]
    })

    if (maps.IDToName) this.IDToName = maps.IDToName
    if (maps.nameToID) this.nameToID = maps.nameToID

    _setProperty('maps', this)

    status.ecs.clearAllEntitites()
    const {spawners} = p5.prototype
    for (key in maps.toSpawn) {
      key = key.toLowerCase()
      if (!spawners[key]) throw new Error(`faled to load map ${name}, ${key} spawner not found:\n`, spawners)
      maps.toSpawn[key].forEach(args => {
        spawners[key].spawn(...args, status)
      })
    }
  }

  settings(settings) {
    addDefaultOptions(settings, {tileWidth: this.s, type: this.type})
    if (!settings.type) throw new Error('please specify a map type')
    if (!settings.tileWidth) throw new Error('please specify a size (s)')
    this.type = settings.type
    this.s = settings.tileWidth
  }
}

p5.prototype.setMap = map => {
  if (!currentStatus) throw new Error(`call setCurrentStatus() before setting a map!`)
  status.maps.setMap(map)
}

// p5.prototype.saveCurrentMap = name => {
//   p5.prototype.saveMap(name, p5.prototype.maps)
// }
//
// p5.prototype.saveMap = (name, maps) => {
//   if (!name) throw new Error(`Name non specified for: \n`, maps)
//   if (p5.prototype.mapsSaved[name]) console.warn(`overwriting map: ${name}`);
//   p5.prototype.mapsSaved[name] = maps
// }


function parseMap(json, type) {
  addDefaultOptions(json, {toSpawn: {}})
  const maps = {}
  const tileMap = json.tileMap || initialMapParse(json)
  const w = maps.w = (tileMap.w || json.w), h = maps.h = (tileMap.h || json.h)

  if (type == 'pacman') {
    maps.nameToID = {innerTile: 0, wallTile: 1, outerTile: 2}
    maps.IDToName = ['innerTile', 'wallTile', 'outerTile']
    maps.tileMap = parsePacmanTileMap(tileMap)
    maps.collisionMap = parsePacmanCollisionMap(tileMap)
    maps.graphicalMap = parsePacmanGraphicalMap(tileMap)
  } else {
    throw new Error(`Invalid maps type: ${type}`)
  }

  if (json.s) maps.s = json.s
  maps.name = json.name
  maps.toSpawn = json.toSpawn

  return maps
}

function initialMapParse(json) {
  addDefaultOptions(json, {shapes: {}})
  const tileMap = []

  const {w, h} = getMapSize(json, 1)
  tileMap.w = w, tileMap.h = h

  fillShapes(tileMap, json)

  return tileMap
}

function getMapSize(json, border = 1) {
  let ws = 99, hs = 99, we = 0, he = 0 //s = start, e = end
  for (let shape in json.shapes) {
    for (let fill in json.shapes[shape]) {
      json.shapes[shape][fill].forEach(points => {
        let x1, y1, x2, y2
        if (shape == 'rect') [x1, y1, x2, y2] = points
        else if (shape == 'point') [x1, y1] = [x2, y2] = points
        else throw new Error(`Invalid shape, ${shape} is not a shape`)
        ws = x1 < ws ? x1 : ws
        hs = y1 < hs ? y1 : hs
        we = x2 > we ? x2 : we
        he = y2 > he ? y2 : he
      })
    }
  }

  // set map size
  if (ws != border || hs != border) throw new Error(`invalid map, nullpunkt invalid, ${ws}${hs}`)

  const w = we + border * 2, h = he + border * 2
  return {w: w, h: h}
}

function fillShapes(tileMap, json) {
  for (let shape in json.shapes) {
    for (let fill in json.shapes[shape]) {
      const toFill = parseInt(fill)
      if (!Number.isInteger(toFill)) throw new Error(`Invalis fill: ${fill}`)
      json.shapes[shape][fill].forEach(points => {
        let x1, y1, x2, y2
        if (shape == 'rect') [x1, y1, x2, y2] = points
        else if (shape == 'point') [x1, y1] = [x2, y2] = points
        else throw new Error(`Invalid shape, ${shape} is not a shape`)
        for (let x = x1; x <= x2; x++) {
          for (let y = y1; y <= y2; y++) {
            tileMap[y * tileMap.w + x] = toFill
          }
        }
      })
    }
  }
}

function parsePacmanTileMap(tileMap) {
  const {w, h} = tileMap, innerTile = 0, wallTile = 1, outerTile = 2
  //loop through current map and set border as wallTile
  fillOffsets(tileMap, [-w - 1, -w, -w + 1, -1, 1, w - 1, w, w + 1], innerTile, wallTile)
  //loop through map and set everithing else as outerTile
  setUndefined(tileMap, w * h, outerTile)
  return tileMap
}

function fillOffsets(tileMap, offsets, toCheck, replace) {
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
}

function setUndefined(tileMap, j, tile) {
  for (let i = 0; i < j; i++) {
    if (typeof tileMap[i] == 'undefined') {
      tileMap[i] = tile
    }
  }
}

function parsePacmanGraphicalMap(tileMap) {
  const graphicalMap = []
  tileMap.forEach((tile, i) => {
    graphicalMap[i] = getGraphicalPacmanTile(tileMap, i)
  })
  return graphicalMap
}

function parsePacmanCollisionMap(tileMap) {
  const {w} = tileMap, collisionMap = [], innerTile = 0, wallTile = 1
  const {collideTop, collideRight, collideBottom, collideLeft} = p5.prototype.flags
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
  return collisionMap
}

function getGraphicalPacmanTile(tileMap, i) {
  const {w} = tileMap, tile = tileMap[i], wallTile = 1, outerTile = 2, graphicalMap = []
  if (tile == wallTile) {
    const l = i % w == 0
    const r = i % w == w - 1
    const offsets = [l ? 0 : -w - 1, -w, r ? 0 : -w + 1, l ? 0 : -1, r ? 0 : 1, l ? 0 : w - 1, w, r ? 0 : w + 1].map(offset => {
      return (typeof tileMap[i + offset] != 'undefined' && offset != 0) ? tileMap[i + offset] : outerTile
    })
    return p5.prototype.sprites.tiles.tilePieces.converter[getPacmanGraphicalString(...offsets)]
  } else {
    return 0
  }
}

function getPacmanGraphicalString(tl, t, tr, l, r, bl, b, br) {
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
  p5.prototype.sprites.tiles.tilePieces.add(tile)

  return tile
}

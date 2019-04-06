class Game extends Status {
  constructor({type = 'pacman', tileWidth = 16} = {}) {
    super()

    this.gameType = type
    this.maps = new Maps()

    if (type == 'pacman') {
      this.maps.settings({tileWidth, type})

      this.camera.settings({cameraMode: 'auto', cameraOverflow: 'display', ratio: 16 / 9, cameraWidth: 480})
      this.camera.addTileLayer()
      this.camera.addSpriteLayer()

      this.addPreFunction(() => this.camera.noSmooth())
    } else {
      throw new Error(`unknown game type: ${type}`)
    }
  }

  spawn(Constructor, ...args) {
    //check if valid entity
    if (!Constructor.prototype._parentName) Constructor.prototype._parentName = getParentName(Constructor.prototype)
    if (!Constructor.prototype._className) Constructor.prototype._className = deCapitalize(Constructor.name)

    //add it
    const entity = new Constructor(...args)
    this.ecs[entity._parentName].add(entity)

    return entity
  }

  createSpawner(Constructor, key) {
    if (!key) key = deCapitalize(Constructor.name)

    if (!Constructor.prototype._parentName) Constructor.prototype._parentName = getParentName(Constructor.prototype)
    if (!Constructor.prototype._className) Constructor.prototype._className = deCapitalize(Constructor.name)

    const {_parentName, _className} = Constructor.prototype
    console.log(`new spawner for ${_parentName}, with key ${key}, extending ${_parentName}`);

    if (p5.prototype.spawners[key]) {
      console.error(`Spawner named: ${key} already exists!`)
    } else {

      const spawner = {spawn: (...args) => this.spawn(Constructor, ...args)}

      return p5.prototype.spawners[key] = spawner
    }
  }

  createSpawners(...spawners) {
    spawners.forEach(spawner => {
      this.createSpawner(spawner)
    })
  }

}

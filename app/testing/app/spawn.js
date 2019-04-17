p5.prototype.spawners = {}
p5.prototype.pools = {}

class ECS {
  constructor(parent)  {
    this.entities = new Set()
    this.classes = { statuses: new Set() }

    this._status = parent
    this._listener = parent.listener
    this.statusName = parent.statusName
    this.spawners = p5.prototype.spawners[this.statusName] = []

    this.entitiesToKill = new Map()
  }

  createSpawner(Constructor, key) {
    if (typeof Constructor != 'function') throw new Error('Constructor must be a function!')
    if (!(Constructor.prototype instanceof Entity)) throw new Error('Constructor must extend Entity!')

    //check for key
    if (!key) key = deCapitalize(Constructor.name)

    if (this.classes[key]) throw new Error(`Invalid className: ${key}, it already exists!`)
    this.classes[key] = new Set()

    //return and add reference of spawner for maps
    return p5.prototype.spawners[this.statusName][key] = this.spawners[key] = (...args) => this._addEntity(new Constructor(...args), key)
  }

  createSpawners(...spawners) {
    spawners.forEach(spawner => this.createSpawner(spawner))
  }

  _addEntity(entity, name) {
    //add it to the right class
    this.entities.add(entity)
    this.classes[name].add(entity)

    //listen for its listeners
    this._listener.addListener(entity, ...entity._toListenFor)

    //add references to the entity
    entity._status = this._status
    entity._ecs = this
  }

  spawn(entity) {
    //entity must extend Entity class
    if (!(entity instanceof Entity)) throw new Error('Entity must extend Entity!')

    //if its a status, add it without className distinction
    if (entity instanceof Status) return this._addEntity(entity, 'statuses')

    //check if classes set exist
    const {name} = entity.constructor
    if (!this.classes[name]) this.classes[name] = new Set()

    this._addEntity(entity, name)
  }

  despawn(entity) {
    this.entities.delete(entity)

    for (let key in this.classes) {
      this.classes[key].delete(entity)
    }

    this._listener.removeListener(entity)
  }

  update() {
    this.entities.forEach(entity => entity.update())

    this.killEntitiesToKill()
  }

  fixedUpdate() {
    const entities = [...this.entities]

    //fixedUpdate entities
    this.entities.forEach(e => {
      e.xv += e.xa; e.yv += e.ya
      e.x += e.xv; e.y += e.yv
      if (e._collideWithMap) p5.prototype.collideRectMap(e)
      e.fixedUpdate()
    })

    this.killEntitiesToKill()

    //check collisons, for every entity
    for (let i = entities.length - 1; i >= 0; i--) {
      //check all others entity
      for (let j = i - 1; j >= 0; j--) {
        //if they are colliding
        if (p5.prototype.collideRectRect(entities[i], entities[j])) {
          //create flags and check if they want to collide
          let e1 = entities[i], e2 = entities[j], solve1 = true, solve2 = true
          e1.onCollision({collider: e2, stopCollision: () => solve1 = false, stopOtherCollision: () => solve2 = false})
          e2.onCollision({collider: e1, stopCollision: () => solve2 = false, stopOtherCollision: () => solve1 = false})

          //depending on how they want to collide, collide them
          if (solve1 && solve2) p5.prototype.solveRectRect(e1, e2)
          else if (solve1) p5.prototype.solveRectIRect(e1, e2)
          else if (solve2) p5.prototype.solveRectIRect(e2, e1)

          //if some died, skip loop properly
          if (e1.killed && e2.killed) {i--; break}
          else if (e1.killed) i--
          else if (e2.killed) break

          //once the loop was skipped, remove extra entity
          this.killEntitiesToKill()
        }
      }
    }
  }

  killEntitiesToKill() {
    //remove all entitiesToKill
    this.entitiesToKill.forEach(entity => {
      this.deleteEntity(entity)
    })

    for (let [entity, to] of this.entitiesToKill) {
      if (this.deleteEntity(entity)) {
        if (to) this._addEntity(entity, to)
      } else {
        throw new Error(`entity not present in ecs!!`)
        debugger
      }
    }

    this.entitiesToKill.clear()
  }
}

function getParentName(target) {
  //if it already has the name, return it
  if (target._parentName) return target._parentName

  //if it douesn't, crete flag
  let name

  //check all possibility
  if (target instanceof Entity) name = 'entities'
  else if (target instanceof Animation) name = 'animation'
  else if (target instanceof Master) throw new Error(`Extending only Master? ${target}`)

  //if none found, throw
  if (!name) throw new Error(`Plese extend calls Entity, Status, Animation, Game or Menu, invalid: ${target}`)

  //set to prototype and return
  return target._parentName = name
}

//if spawnOne is called, spawn it in the current stauts
p5.prototype.spawnOne = (Constructor, ...args) => {
  if (!currentStatus) throw new Error(`call setCurrentStatus() before spawning entities!`)

  status.spawn(Constructor, ...args)
}

//if createSpawner is called outside of a ecs, call it on the currentStatus
p5.prototype.createSpawner = (Constructor, key) => {
  if (!currentStatus) throw new Error(`call setCurrentStatus() before creating spawner!`)

  status.createSpawner(Constructor, key)
}

p5.prototype.createSpawners = (...toCreate) => {
  toCreate.forEach(constructor => {
    p5.prototype.createSpawner(constructor)
  })
}

// p5.prototype.createPool = (key, constructor, options) => {
//   if (p5.prototype.pools[key]) {
//     throw new Error(`Pool named: ${key} already exists!`)
//   }
//
//   addDefaultOptions(options, defaultOptions.createPool)
//
//   const pool = p5.prototype.pools[key] = {
//     constructor: constructor,
//     active: [],
//     inactive: [],
//   }
//
//   for (let i = 0; i < options.max; i++) {
//     pool.inactive = new constructor()
//   }
//
//   return {
//     get: () => {
//       if (pool.inactive.size) {
//         return pool.inactive.splice(0, 1)
//       } else if (options.overflow != 'stop') {
//         if (options.overflow == 'last') {
//           return pool.active.splice(0, 1)
//         } else if (options.overflow == 'create') {
//           return new constructor()
//         }
//       }
//     }
//   }
// }

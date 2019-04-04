const entitiesToKill = []
const entitiesToChange = new Map()

class ECS {
  constructor()  {
    this.entities = new Set()
    this.animations = new Set()
    this.others = new Set()
  }

  update() {
    this.entities.forEach(entity => entity.update())
    this.animations.forEach(animation => animation.update())
    this.others.forEach(other => other.update())

    this.killEntitiesToKill()
  }

  fixedUpdate() {
    const {animations, others} = this
    const entities = [...this.entities]

    //fixedUpdate entities
    this.entities.forEach(e => {
      e.xv += e.xa; e.yv += e.ya
      e.x += e.xv; e.y += e.yv
      p5.prototype.collideRectMap(e)
      e.fixedUpdate()
    })

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
    entitiesToKill.forEach(entity => {
      this.deleteEntity(entity)
    })

    for (let [entity, to] of entitiesToChange) {
      if (this.deleteEntity(entity)) {
        entity.parentName = to
        this[to].add(entity)
      } else {
        throw new Error(`entity not present in ecs!!`)
        debugger
      }
    }

    entitiesToKill.splice(0)
    entitiesToChange.clear()
  }

  deleteEntity(entity) {
    p5.prototype.removeListener(entity)
    return this.entities.delete(entity) || this.animations.delete(entity) || this.others.delete(entity)
  }

  clearAllEntitites() {
    this.entities.clear()
    this.animations.clear()
    this.others.clear()
  }
}

p5.prototype.spawners = {}
p5.prototype.pools = {}

function getParentName(target) {
  //if it already has the name, return it
  if (target.parentName) return target.parentName

  //if it douesn't, crete flag
  let name

  //check all possibility
  if (target instanceof Entity) name = 'entities'
  else if (target instanceof Status) name = 'others'
  else if (target instanceof Animation) name = 'animation'
  else if (target instanceof Master) throw new Error(`Extending only Master? ${target}`)

  //if none found, throw
  if (!name) throw new Error(`Plese extend calls Entity, Status, Animation, Game or Menu, invalid: ${target}`)

  //set to prototype and return
  return target.parentName = name
}

p5.prototype.spawnOne = (Constructor, ...args) => {
  if (!currentStatus) throw new Error(`call setCurrentStatus() before spawning entities!`)
  if (!Constructor.prototype.parentName) Constructor.prototype.parentName = getParentName(Constructor.prototype)
  if (!Constructor.prototype.className) Constructor.prototype.className = deCapitalize(Constructor.name)

  const entity = new Constructor(...args)
  const {parentName} = entity

  status.ecs[parentName].add(entity)

  return entity
}

window.createSpawner = (Constructor, key) => {
  if (!key) key = deCapitalize(Constructor.name)

  const parentName = getParentName(Constructor.prototype)
  Constructor.prototype.className = deCapitalize(Constructor.name)

  console.log(`new spawner for ${key} extending ${parentName}`);

  if (p5.prototype.spawners[key]) {
    console.error(`Spawner named: ${key} already exists!`)
  } else {

    const spawner = {spawn: (...args) => p5.prototype.spawnOne(Constructor, ...args)}

    return p5.prototype.spawners[key] = spawner
  }
}

window.createSpawners = (...toCreate) => {
  toCreate.forEach(constructor => {
    window.createSpawner(constructor)
  })
}

p5.prototype.createPool = (key, constructor, options) => {
  if (p5.prototype.pools[key]) {
    throw new Error(`Pool named: ${key} already exists!`)
  }

  addDefaultOptions(options, defaultOptions.createPool)

  const pool = p5.prototype.pools[key] = {
    constructor: constructor,
    active: [],
    inactive: [],
  }

  for (let i = 0; i < options.max; i++) {
    pool.inactive = new constructor()
  }

  return {
    get: () => {
      if (pool.inactive.size) {
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

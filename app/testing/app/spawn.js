const ecs = {
  entities: [],
  hitboxes: [],
  animations: []
}

p5.prototype.spawners = {}
p5.prototype.pools = {}

function getParentName(instance) {
  const name = instance.__proto__.name
  switch (name) {
    case 'Entity': return 'entities'; break;
    case 'Hitbox': return 'hitboxes'; break;
    case 'Animation': return 'animations'; break;
    case 'Object': throw new Error(`Invalid constructor, please extend Entity, Hitbox, or Animations`); break;
    case 'Function': debugger; throw new Error(`Invalid constructor??`); break;
    default: return getParentName(instance.__proto__);
  }
}

p5.prototype.spawnOne = (Constructor, parentName, ...args) => {
  const entity = new Constructor(...args)
  if (!parentName) parentName = getParentName(Constructor)
  const id = entity._id
  ecs[parentName].push(entity)

  if (entity.kill) throw new Error(`Cannot have kill method on ${Constructor.name}`)
  entity.kill = () => {
    const index = ecs[parentName].findIndex(e => e._id == id)
    if (index == -1) {
      console.error('Object alredy deleted')
      return false
    }

    removeListener(entity)

    ecs[parentName].splice(index, 1)
    return true
  }

  if (entity.changeParentName) throw new Error(`Cannot have changeParentName method on ${Constructor.name}`)
  entity.changeParentName = newParentName => {
    if (!['entities', 'animations', 'hitboxes'].includes(newParentName)) throw new Error(`Invalid newParentName: ${parentName}`)

    const index = ecs[parentName].findIndex(e => e._id == id)
    if (index == -1) {
      console.error('Object alredy deleted')
      return false
    }
    ecs[newParentName].push(ecs[parentName].splice(index, 1)[0])
    parentName = newParentName
    return true
  }

  return entity
}

window.createSpawner = (Constructor, key) => {

  if (!key) key = Constructor.name.toLowerCase()
  const parentName = getParentName(Constructor)
  Constructor.className = key
  Constructor.parentName = parentName

  console.log(`new spawner for ${key} extending ${parentName}`);

  if (p5.prototype.spawners[key]) {
    console.error(`Spawner named: ${key} already exists!`)
  } else {
    const spawner = {
      spawn: (...args) => {
        return p5.prototype.spawnOne(Constructor, parentName, ...args)
      }
    }
    p5.prototype.spawners[key] = spawner
    return spawner
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

function updateECS() {
  const {entities, hitboxes, animations} = ecs

  //update all
  for (let i = animations.length - 1; i >= 0; i--) {
    animations[i].update()
  }

  for (let i = hitboxes.length - 1; i >= 0; i--) {
    hitboxes[i].update()
  }

  for (let i = entities.length - 1; i >= 0; i--) {
    entities[i].update()
  }
}

function fixedUpdateECS() {
  const {entities, hitboxes, animations} = ecs

  //fixedUpdate entities
  for (let i = entities.length - 1; i >= 0; i--) {
    e = entities[i]
    e.xv += e.xa; e.yv += e.ya
    e.x += e.xv; e.y += e.yv
    p5.prototype.collideRectMap(e, true)
    e.fixedUpdate()
  }

  //check collisons
  for (let i = entities.length - 1; i >= 0; i--) {
    for (let j = i - 1; j >= 0; j--) {
      if (p5.prototype.collideRectRect(entities[i], entities[j])) {
        let e1 = entities[i], e2 = entities[j], solve1 = true, solve2 = true, killed1, killed2
        e1.onCollisionEntry({collider: e2, stopCollison: () => solve1 = false, stopOtherCollision: () => solve2 = false})
        e2.onCollisionEntry({collider: e1, stopCollison: () => solve2 = false, stopOtherCollision: () => solve1 = false})

        if (solve1 && solve2) p5.prototype.solveRectRect(e1, e2)
        else if (solve1) p5.prototype.solveRectIRect(e1, e2)
        else if (solve2) p5.prototype.solveRectIRect(e2, e1)

        killed1 = e1.onCollisionExit({collider: e2, solved: solve1})
        killed2 = e2.onCollisionExit({collider: e1, solved: solve2})

        if (killed1 && killed2) {i--; break}
        else if (killed1) break
        else if (killed2) i--
      }
    }

    for (let j = hitboxes.length - 1; j >= 0; j--) {
      if (p5.prototype.collideRectRect(entities[i], hitboxes[j])) {
        entities[i].onHitboxEntry({collider: hitboxes[j]})
        hitboxes[j].onCollisionEntry({collider: entities[i]})
      }
    }
  }
}

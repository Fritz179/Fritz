class ECS {
  constructor()  {
    this.entities = []
    this.hitboxes = []
    this.animations = []
    this.blocks = []
  }

  update() {
    for (let i = this.animations.length - 1; i >= 0; i--) {
      this.animations[i].update()
    }

    for (let i = this.hitboxes.length - 1; i >= 0; i--) {
      this.hitboxes[i].update()
    }

    for (let i = this.entities.length - 1; i >= 0; i--) {
      this.entities[i].update()
    }

    for (let i = this.blocks.length - 1; i >= 0; i--) {
      this.blocks[i].update()
    }
  }

  fixedUpdate() {
    const {entities, hitboxes, animations, blocks} = this

    //fixedUpdate entities
    for (let i = entities.length - 1; i >= 0; i--) {
      const e = entities[i]
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
          else if (killed1) i--
          else if (killed2) break
        }
      }

      for (let j = hitboxes.length - 1; j >= 0; j--) {
        if (p5.prototype.collideRectRect(entities[i], hitboxes[j])) {
          entities[i].onHitboxEntry({collider: hitboxes[j]})
          hitboxes[j].onCollisionEntry({collider: entities[i]})
        }
      }

      for (let j = blocks.length - 1; j >= 0; j--) {
        if (p5.prototype.collideRectRect(entities[i], blocks[j])) {
          let e = entities[i], b = blocks[j], solve = true, killed = false
          e.onBlockEntry({collider: b, stopCollison: () => solve = false})
          b.onCollisionEntry({collider: e, stopCollison: () => solve = false})

          if (solve) p5.prototype.solveRectIRect(e, b)
          killed = e.onBlockExit({collider: b, solved: solve})
          b.onCollisionExit()

          if (killed) break
        }
      }
    }
  }

  clearAllEntitites() {
    this.entities.splice(0)
    this.hitboxes.splice(0)
    this.animations.splice(0)
    this.blocks.splice(0)
  }
}

p5.prototype.spawners = {}
p5.prototype.pools = {}

function getParentName(instance) {
  const name = instance.__proto__.name
  switch (name) {
    case 'Entity': return 'entities'; break;
    case 'Hitbox': return 'hitboxes'; break;
    case 'Animation': return 'animations'; break;
    case 'Block': return 'blocks'; break;
    case 'Object': throw new Error(`Invalid constructor, please extend Entity, Hitbox, or Animations`); break;
    case 'Function': debugger; throw new Error(`Invalid constructor??`); break;
    default: return getParentName(instance.__proto__);
  }
}

p5.prototype.spawnOne = (Constructor, parentName, ...args) => {
  if (!currentStatus) throw new Error(`call setCurrentStatus() before spawning entitites!`)

  const entity = new Constructor(...args)
  if (!parentName) parentName = getParentName(Constructor)
  const id = entity._id
  status.ecs[parentName].push(entity)

  if (entity.kill) throw new Error(`Cannot have kill method on ${Constructor.name}`)
  entity.kill = () => {
    const index = status.ecs[parentName].findIndex(e => e._id == id)
    if (index == -1) {
      console.error('Object alredy deleted')
      return false
    }

    removeListener(entity)

    status.ecs[parentName].splice(index, 1)
    return true
  }

  if (entity.changeParentName) throw new Error(`Cannot have changeParentName method on ${Constructor.name}`)
  entity.changeParentName = newParentName => {
    if (!['entities', 'animations', 'hitboxes', 'blocks'].includes(newParentName)) throw new Error(`Invalid newParentName: ${parentName}`)

    const index = status.ecs[parentName].findIndex(e => e._id == id)
    if (index == -1) {
      console.error('Object alredy deleted')
      return false
    }
    status.ecs[newParentName].push(status.ecs[parentName].splice(index, 1)[0])
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

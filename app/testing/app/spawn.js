const ecs = {
  entities: [],
  hitboxes: [],
  animations: []
}

const spawners = {}
const pools = {}
function initSpawner() {

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

  fritz.spawnOne = (Constructor, parentName) => {
    const entity = new Constructor()
    if (!parentName) parentName = getParentName(Constructor)
    const id = entity._id
    ecs[parentName].push(entity)

    if (entity.kill) throw new Error(`Cannot have kill method on ${key}`)
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
    return entity
  }

  fritz.createSpawner = (Constructor, key) => {

    if (!key) key = Constructor.name.toLowerCase()
    const parentName = getParentName(Constructor)
    Constructor.className = key
    Constructor.parentName = parentName

    console.log(`new spawner for ${key} extending ${parentName}`);

    if (spawners[key]) {
      throw new Error(`Spawner named: ${key} already exists!`)
    } else {
      const spawner = {
        spawn: () => {
          return fritz.spawnOne(Constructor, parentName)
        }
      }
      spawners[key] = spawner

      return spawner
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
}

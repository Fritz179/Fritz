createGame({type: 'pacman', levels: true, tileWidth: 16, cameraMode: 'multiple', cameraOverflow: 'hidden', cameraRatio: 16/9, cameraWidth: 480})
createSpawners(Shooter, Bullet)

let playerSpawner = createSpawner(Player), player

function preload() {
  createMenu('mainMenu')
  loadSpriteSheet('tiles', {type: 'tiles', json: false})
  loadSpriteSheet('player', {type: 'animations'})
  loadSpriteSheet('shooter', {type: 'animations'})
  loadSpriteSheet('bullet', {type: 'animations'})
  loadMap('level_0')
  //loadAndSetMap('level_0')
}

function setup() {
  changeStatus('mainMenu')
  onStatusChange('play', () => {
    setmap('level_0')
    player = playerSpawner.spawn().setPos(16, 16)
    // player = spawners.player.spawn().setPos(200, 200)
    // player = spawnOne(Player).setPos(200, 200)
    follow(player)
    listenInput(player, 'play')
  })
}

// TODO: 'update' README //wichtig ;-)

// TODO: createPool => set global reference, return reference add to game.pools or game.spawners (pool class with reset)
// pool return => {pool, storeAll, poolSize, activeSize, set(options)}

// TODO: loadLevel retunrs {start()}

// TODO: create Menu and status

// TODO: chek if correct
// if (killed1 && killed2) {i--; break}
// else if (killed1) break
// else if (killed2) i--

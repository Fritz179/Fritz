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

//zoom 110%?

// TODO: 'update' README //wichtig ;-)

// TODO: createPool => set global reference, return reference add to game.pools or game.spawners (pool class with reset)
// pool return => {pool, storeAll, poolSize, activeSize, set(options)}

// TODO: loadLevel retunrs {start()}

// TODO: create Menu and status

// TODO: chek if correct
// if (killed1 && killed2) {i--; break}
// else if (killed1) break
// else if (killed2) i--

// let playerSpawner = createSpawner(Player), player
createSpawners(Shooter, Bullet, Player, End)

function preload() {
  loadSpriteSheet('tiles', {type: 'pacmanTiles', json: false})
  loadSpriteSheets('player', 'End', 'shooter', 'bullet')
  loadMap('level_0')

  createStatus('mainMenu', status => {
    status.createMenu('mainMenu')
  })

  createStatus('levelSelection', status => {
    status.createMenu('levelSelection', LevelSelection, {}) // {json: false, callback?, }
  })

  createStatus('play', () => {
    cameraSettings({ratio: 16 / 9})
    createGame('pacman', {tileWidth: 16})
    addForegroundLayer(canvas => {

    })
    preFunction(() => {

    })
    postFunction(() => {

    })
    onMapLoad(map => {
      spawners.players.spawn(map.playerX, map.playerY)
    })

  })

  setCurrentStatus('mainMenu')
}

class CustomEntity extends Entity {
  constructor() {
    this.collideWith([])
    this.dontCollideWith([])

    this.setSize()
    this.setPos()
    this.setVel()
    this.affectedByGravity = false

    this.listen('all', 'click', 'key', 'mouse')

    this.onClick = () => console.log("i've been clicked");
    this.onClickDragged = () => console.log("I've been dragged");
    this.onClickReleased = () => console.log("I've been released");

    this.onKey = key => console.log(`key: ${key} has been pressed`);
    this.onKeyReleased = key => console.log(`key: ${key} has been released`);

    this.onMouse = () => console.log('Mouse has been clicked');
    this.onMouseDragged = () => console.log('Mouse has been dragged');
    this.onMouseReleased = () => console.log('Mouse has been clicked');
  }
}

createGame({type: 'pacman', levels: true, tileWidth: 16, cameraMode: 'multiple', cameraRatio: 16/9, cameraWidth: 480})
createSpawners(Shooter, Bullets)

let playerSpawner = createSpawner(Player), player

function preload() {
  loadSpriteSheet('tiles', {type: 'tiles', json: false})
  loadSpriteSheet('player', {type: 'animations'})
  loadSpriteSheet('shooter', {type: 'animations'})
  loadMap('level_0')
}

function setup() {
  player = playerSpawner.spawn().setPos(16, 16)
  // player = spawners.player.spawn().setPos(200, 200)
  // player = spawnOne(Player).setPos(200, 200)
  follow(player)
  listenInput(player)
}

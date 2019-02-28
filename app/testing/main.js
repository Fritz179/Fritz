createGame({type: 'pacman', levels: true, tileWidth: 16, cameraMode: 'multiple', cameraOverflow: 'hidden', cameraRatio: 16/9, cameraWidth: 480})
createSpawners(Shooter, Bullet)

let playerSpawner = createSpawner(Player), player

function preload() {
  createMenu(Menu, 'mainMenu')
  loadSpriteSheet('tiles', {type: 'tiles', json: false})
  loadSpriteSheet('player', {type: 'animations'})
  loadSpriteSheet('shooter', {type: 'animations'})
  loadSpriteSheet('bullet', {type: 'animations'}, sprite => { sprites.bullet = sprite })
  loadMap('level_0')
}

function setup() {
  changeStatus('mainMenu')
  player = playerSpawner.spawn().setPos(16, 16)
  // player = spawners.player.spawn().setPos(200, 200)
  // player = spawnOne(Player).setPos(200, 200)
  follow(player)
  listenInput(player, 'play')
}

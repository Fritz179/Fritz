const options = {
  type: 'pacman',
  levels: true,
  tileWidth: 16,
  cameraMode: 'multiple',
  cameraOverflow: 'display',
  cameraRatio: 16 / 9,
  cameraWidth: 480
}
createSpawners(Shooter, Bullet, Player, End)
createGame('play', options)

// let playerSpawner = createSpawner(Player), player

function preload() {
  createMenu('mainMenu', {cameraRatio: 16 / 9})
  loadSpriteSheet('tiles', {type: 'pacmanTiles', json: false})
  loadSpriteSheet('player')
  loadSpriteSheet('End')
  loadSpriteSheet('shooter')
  loadSpriteSheet('bullet', {type: 'animations'}, sprite => { sprites.bullet = sprite })
  loadAndSetMap('level_0', {namespace: 'play'})
}

function setup() {
  changeStatus('mainMenu')
  // player = playerSpawner.spawn().setPos(16, 16)
  // follow(player)
  // listenInput(player, 'play')
}

function draw() {

}

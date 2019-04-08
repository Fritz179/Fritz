function preload() {
  console.log('preload');
  loadSpriteSheet('tiles', {type: 'pacmanTiles', json: false})
  loadSpriteSheets('player', 'end', 'shooter', 'bullet')

  loadMenuSprite('mainMenu')
  loadMenuSprite('levelSelection')

  loadMap('level_0')
}

function setup() {
  createStatus(MainMenu)
  createStatus(LevelSelection)
  createStatus(Play)

  setCurrentStatus('mainMenu')
}

function draw() {
  //image(menuSprites.levelSelection.main, 0, 0)
}

class Play extends Game {
  constructor() {
    super()
    this.camera.settings({ratio: 16 / 9, cameraWidth: 480, cameraMode: 'multiple', cameraOverflow: 'display'})
    this.pre = level => setMap(level)

    this.createSpawners(Shooter, Bullet, Player, End)
  }
}



// const options = {
//   type: 'pacman',
//   levels: true,
//   tileWidth: 16,
//   cameraMode: 'multiple',
//   cameraOverflow: 'display',
//   cameraRatio: 16 / 9,
//   cameraWidth: 480
// }
// createSpawners(Shooter, Bullet, Player, End)
// createGame('play', options)
//
// // let playerSpawner = createSpawner(Player), player
//
// function preload() {
//   createMenu('mainMenu', {cameraRatio: 16 / 9})
//   createMenu('levelSelection', {cameraRatio: 16 / 9}, LevelSelection)
//   // createMenu('selectLevel', {cameraRatio: 16 / 9})
//   loadSpriteSheet('tiles', {type: 'pacmanTiles', json: false})
//   loadSpriteSheet('player')
//   loadSpriteSheet('End')
//   loadSpriteSheet('shooter')
//   loadSpriteSheet('bullet', {type: 'animations'}, sprite => { sprites.bullet = sprite })
//   loadAndSetMap('level_0', {namespace: 'play'})
//   // loadMap('level_0')
//   // loadMap('level_1')
// }
//
// function setup() {
//   changeStatus('mainMenu')
//   // player = playerSpawner.spawn().setPos(16, 16)
//   // follow(player)
//   // listenInput(player, 'play')
// }
//
// function draw() {
//
// }

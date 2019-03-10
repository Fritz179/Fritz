createSpawners(Shooter, Bullet, Player, End)

function preload() {
  console.log('preload');
  loadSpriteSheet('tiles', {type: 'pacmanTiles', json: false})
  loadSpriteSheets('player', 'End', 'shooter', 'bullet')
  loadMap('level_0')

  // createStatus('mainMenu', () => {
  //   cameraSettings({ratio: 16 / 9})
  //   createMenu(Menu)
  // })
  //
  // createStatus('levelSelection', () => {
  //   cameraSettings({ratio: 16 / 9})
  //   createMenu(LevelSelection)
  // })
}

function setup() {

  createStatus('mainMenu', status => {
    status.createMenu('mainMenu', {}, Menu)
  })

  createStatus('levelSelection', status => {
    status.createMenu('levelSelection', LevelSelection)
  })

  createStatus('play', status => {
    status.createGame('pacman', {tileWidth: 16})
    status.camera.settings({ratio: 16 / 9, cameraWidth: 480})
    status.pre = level => setMap(level)
  })
  setCurrentStatus('play', 'level_0')
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

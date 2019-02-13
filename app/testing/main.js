function preload() {
  addSpriteSheet('tiles')
  addSpriteSheet('player')
}

function setup() {
  console.log(sprites);
  createGame({tileWidth: 16})
  createCanvas(window.innerWidth, window.innerHeight)

  loadMap('level_0')
  // const pl = window['Player']
  // console.log(Player, window.Player);
  // console.log(new window['Player']());
  console.log(new Player().__proto__.__proto__.constructor.name);

}

let off = 0
function draw() {
  // console.log(maps);
  display(sprites.player.idle_right, 0, 600)
  for (let i = 0; i < 10; i++) {
    display(sprites.player.running_right[(i + off) % 10], 50 * i + 50, 0)
  }
  display(sprites.player.idle_left, 0, 500)
  for (let i = 0; i < 10; i++) {
    display(sprites.player.running_left[(i + off) % 10], 50 * i + 50, 100)
  }
  off++
}

class Player extends Entity {
  constructor() {
    super()
    this.setSprite(sprites._player)
    this.setPos(16, 16)
  }
}


///////////////////////////////////////////

// function setup() {
//   createGame({type: 'pacman'})
//   setMapSprite('tiles')
//
//   const playerSpawner = createSpawner('player', Player)
//   playerSpawner.spawn()
//
//   const bulletsPool = createPool('bullets', Bullets, {max: 15, overflow: 'stop'})
//   player.setPos(64, 64)
//   // createPool('')
// }

// class Player extends Entity {
//   constructor(x) {
//     this.setSize(16, 16)
//   }
// }

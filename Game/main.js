//Potential names: "ROCK FALL",
title = "ROCK FALL";

description = `
[Hold]
 Go left or right
`;

characters = [
  `
llllll
ll l l
ll l l
llllll
 l  l
 l  l
  `,
  `
llllll
ll l l
ll l l
llllll
ll  ll
  `,
  `
l   l
lllll
 l l
lllll
l   l
`,
  `
  ll
   ll   
llllll
   ll   
  ll
`,
  `
 llll
l llll
llll l
llll l
ll   l
 llll
`,
];

options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 90,
  theme: "dark",
};

/** @type {{pos: Vector, vx: number, ty: number}} */
let player;
/** @type {{pos: Vector, type: "arrow" | "coin" | "box"}[]} */
let items;
let nextItemDist;
let coinItemCount;
let nextItemSide;
let multiplier;
let lives;
let coinsCollected;

function update() {
  if (!ticks) {
    player = { pos: vec(40, 91), vx: 1, ty: 90 };
    items = [];
    nextItemDist = coinItemCount = 0;
    nextItemSide = 1;
    multiplier = 1;
    lives = 0;
    coinsCollected = 0;
  }
  //How fast the items move down
  const scroll = difficulty * 0.4;
  //Determines what items spawn
  nextItemDist -= scroll;
  if (nextItemDist < 0) {
    if (coinItemCount > 0) {
      items.push({ pos: vec(rnd(3, 97), -3), type: "coin" });
      nextItemDist = 6;
    } else {
      if (coinItemCount < 0 && rnd() < 0.5) {
        coinItemCount = rndi(2, 6);
        nextItemDist = 0;
      } else {
        const x = rnd(3, 97);
        items.push({ pos: vec(x, -3), type: "arrow" });
        nextItemDist = rnd(10, 20);
      }
    }
    items.push({ pos: vec(rnd(3, 97), -3), type: "box"});
    coinItemCount--;
  }
  //Determines Player Movement, will need to toggle the speed
  if(input.isPressed){
    player.pos.x += player.vx * .5;
  }
  //Player color
  color("black");
  //flips character when hit arrow
  const c = char(addWithCharCode("a", floor(ticks / 15) % 2), player.pos, {
    mirror: { x: player.vx < 0 ? -1 : 1 },
  }).isColliding;
  // Makes sure player stays on screen
  if(player.pos.x < 3 || player.pos.x > 97){
    play("laser");
    player.vx *= -1;
    if(player.pos.x < 3){
      player.pos.x++;
    }
    if(player.pos.x > 97){
      player.pos.x--;
    }
  }
  remove(items, (i) => {
    i.pos.y += scroll; //Controls item falling down speed
    if (i.type === "arrow") {
      //Changes color based on player direction
      if(player.vx > 0){
        color("green");
      }else{
        color("purple");
      }
      //changes direction when player changes direction
      const c = char("d", i.pos, {
        mirror: { x: player.vx > 0 ? -1 : 1 },
      }).isColliding;
      //changes player direction when collided with it
      if (c.char.a || c.char.b) {
        play("powerUp");
        player.vx *= -1;
        return true;
      }
    } else if(i.type === "coin") {
      color("yellow");
      const c = char("e", i.pos).isColliding;
      if (c.char.a || c.char.b) {
        play("coin");
        addScore(multiplier * difficulty, i.pos);
        multiplier = clamp(multiplier + 1, 1, 99);
        player.ty += (99 - player.ty) * 0.1;
        coinsCollected++;
        if(coinsCollected>=15){
          lives++;
          coinsCollected -= 20;
        }
        return true;
      }
      //Makes sure items aren't overlapping
      if (c.char.c) {
        if(i.pos.x > 90 || i.pos.x < 10){
          i.pos.y++;
        }else{
          i.pos.x++;
        }
      }
    }else{
      if(player.vx > 0){
        color("red");
      }else{
        color("cyan");
      }
      const c = char("c", i.pos).isColliding;
      //ends game if player touches red boxes
      if(c.char.a || c.char.b){
        if(lives <= 0){
          play("explosion");
          end();
        }else{
          lives--;
          play("synth");
          return true; 
        }
      }
      //Makes sure items aren't overlapping
      if (c.char.c) {
        if(i.pos.x > 90 || i.pos.x < 10){
          i.pos.y++;
        }else{
          i.pos.x++;
        }
      }
      if (c.char.d) {
        if(i.pos.x > 90 || i.pos.x < 10){
          i.pos.y++;
        }else{
          i.pos.x++;
        }
      }
      if (c.char.e) {
        if(i.pos.x > 90 || i.pos.x < 10){
          i.pos.y++;
        }else{
          i.pos.x++;
        }
      }
    }
    //Score calculator
    if (i.pos.y > 103) {
      if (i.type === "coin") {
        multiplier = clamp(multiplier - 1, 1, 99);
      }
      return true;
    }
  });
  //ground
  color("black");
  rect(0, 94, 100, 6);
  //Life counter
  if(lives > -1){
    color("light_black");
    text("lives: " + lives, 5, 96);
  }
}

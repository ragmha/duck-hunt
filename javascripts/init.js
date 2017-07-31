//Initialize Global variables
let context;
let queue;
const WIDTH = 824;
const HEIGHT = 568;
let mouseXPosition;
let mouseYPosition;
let duckImage;
let stage;
let animation;
let deathAnimation;
let spriteSheet;
let enemyXPos = 100;
let enemyYPos = 100;
let enemyXSpeed = 1.5;
let enemyYSpeed = 1.75;
let score = 0;
let gameTimer;
let gameTime = 0;
let timerText;

function Main() {
  document.body.style.cursor = 'none';
  //Setup canvas with width and height
  let canvas = document.getElementById('cnvs');
  context = canvas.getContext('2d');
  context.canvas.width = WIDTH;
  context.canvas.height = HEIGHT;
  stage = new createjs.Stage('cnvs');

  //Set up Asset queue and load sounds
  queue = new createjs.LoadQueue(false);
  queue.installPlugin(createjs.Sound);
  queue.on('complete', queueLoaded, this);
  createjs.Sound.alternateExtensions = ['ogg'];

  // Creating a load manifest for all assets
  queue.loadManifest([
    { id: 'bg', src: 'images/background.png' },
    { id: 'crossHair', src: 'images/crosshair.png' },
    { id: 'shot', src: 'sounds/shot.mp3' },
    { id: 'background', src: 'sounds/background.mp3' },
    { id: 'gameOverSound', src: 'sounds/gameover.mp3' },
    { id: 'tick', src: 'sounds/tick.mp3' },
    { id: 'deathSound', src: 'sounds/quak.mp3' },
    { id: 'duckSpritesheet', src: 'images/duck_right.png' },
    { id: 'duckDeath', src: 'images/duck_dead.png' },
  ]);
  queue.load();

  //Create timer that updates once per second
  gameTimer = setInterval(updateTime, 1000);
}

function queueLoaded(event) {
  //Adding background Image
  let backgroundImage = new createjs.Bitmap(queue.getResult('bg'));
  stage.addChild(backgroundImage);

  //Add score
  scoreText = new createjs.Text(
    'Score: ' + score.toString(),
    '36px Arial',
    '#020202'
  );
  scoreText.x = 10;
  scoreText.y = 10;
  stage.addChild(scoreText);

  //Add timer
  timerText = new createjs.Text(
    'Time: ' + gameTime.toString(),
    '36px Comic Sans',
    '#020202'
  );
  timerText.x = 670;
  timerText.y = 10;
  stage.addChild(timerText);

  //GameOver
  timerTexts = new createjs.Text('', '80px Comic Sans', '#EE3608');
  timerTexts.x = 300;
  timerTexts.y = 200;
  stage.addChild(timerTexts);

  //Play background sound
  createjs.Sound.play('background', { loop: -1 });

  // Create duck spritesheet
  spriteSheet = new createjs.SpriteSheet({
    images: [queue.getResult('duckSpritesheet')],
    frames: { width: 42, height: 40 },
    animations: { flap: [0, 2] },
  });

  //Create a duck spritesheet
  duckDeathSpriteSheet = new createjs.SpriteSheet({
    images: [queue.getResult('duckDeath')],
    frames: { width: 45, height: 34 },
    animations: { die: [0, 1, false, 0] },
  });

  // Create duck sprite
  createEnemy();

  // Create crosshair
  crossHair = new createjs.Bitmap(queue.getResult('crossHair'));
  stage.addChild(crossHair);

  //Add ticker
  createjs.Ticker.setFPS(15);
  createjs.Ticker.addEventListener('tick', stage);
  createjs.Ticker.addEventListener('tick', tickEvent);

  //Settings events after game is loaded
  window.onmousemove = handleMouseMove;
  window.onmousedown = handleMouseDown;
}

function createEnemy() {
  animation = new createjs.Sprite(spriteSheet, 'flap');
  animation.regX = 46;
  animation.regY = 35;
  animation.x = enemyXPos;
  animation.y = enemyYPos;
  animation.gotoAndPlay('flap');
  stage.addChildAt(animation, 1);
}

function duckDeath() {
  (deathAnimation = new createjs.Sprite(
    duckDeathSpriteSheet,
    'die'
  )), (deathAnimation.regX = 99);
  deathAnimation.regY = 58;
  deathAnimation.x = enemyXPos;
  deathAnimation.y = enemyYPos;
  deathAnimation.gotoAndPlay('die');
  stage.addChild(deathAnimation);
}

function tickEvent() {
  // Making sure the duck is with the game boundaries and move duck

  if (enemyXPos < WIDTH && enemyXPos > 0) {
    enemyXPos += enemyXSpeed;
  } else {
    enemyXSpeed = enemyXSpeed * -1;
    enemyXPos += enemyXSpeed;
  }
  if (enemyYPos < HEIGHT && enemyYPos > 0) {
    enemyYPos += enemyYSpeed;
  } else {
    enemyYSpeed = enemyYSpeed * -1;
    enemyYPos += enemyYSpeed;
  }

  animation.x = enemyXPos;
  animation.y = enemyYPos;
}

function handleMouseMove(event) {
  //Offset the position by 45 pixels so mouse is in center of crosshair
  crossHair.x = event.clientX - 285;
  crossHair.y = event.clientY - 45;
}

function handleMouseDown(event) {
  //Playing Gunshot sound
  createjs.Sound.play('shot');

  //Increase speed of enemy slightly
  enemyXSpeed *= 1.05;
  enemyYSpeed *= 1.06;

  //Obtain Shoot position
  let shotX = Math.round(event.clientX - 285);
  let shotY = Math.round(event.clientY - 45);
  let spriteX = Math.round(animation.x);
  let spriteY = Math.round(animation.y);

  //Compute the X and Y distance using absolute value
  let distX = Math.abs(shotX - spriteX);
  let distY = Math.abs(shotY - spriteY);

  //Anywhere in the body or head is a hit[but not on wings]
  if (distX < 65 && distY < 49) {
    //Hit
    stage.removeChild(animation);
    duckDeath();
    score += 10;
    scoreText.text = 'Score: ' + score.toString();
    createjs.Sound.play('deathSound');

    //Make it difficult next time
    enemyXSpeed *= 1.3;
    enemyYSpeed *= 1.25;

    //Create new enemy
    let timeToCreate = Math.floor(Math.random() * 3500 + 1);
    setTimeout(createEnemy, timeToCreate);
  } else {
    //Miss
    score -= 5;
    scoreText.text = 'Score: ' + score.toString();
  }
}

function updateTime() {
  gameTime += 1;
  if (gameTime > 60) {
    //End Game and Clean Up
    timerTexts.text = 'GAME OVER';
    stage.removeChild(animation);
    stage.removeChild(crossHair);
    let si = createjs.Sound.play('gameOverSound');
    createjs.Sound.stop();
    clearInterval(gameTimer);
  } else {
    timerText.text = 'Time: ' + gameTime;
    createjs.Sound.play('tick');
  }
}

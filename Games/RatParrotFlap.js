window.addEventListener("load", () => {
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");

  canvas.width = 900;
  canvas.height = 500;

  const font = new FontFace(
    "PressStart2P",
    "url(https://fonts.gstatic.com/s/pressstart2p/v11/e3t4euO8T-267oIAQAu6jDQyK3nX.woff2)"
  );
  font.load().then(f => document.fonts.add(f));

  const ratUp = new Image();
  ratUp.src = "../Assets/RatWingUp.png";

  const ratDown = new Image();
  ratDown.src = "../Assets/RatWingDown.png";

  const pipeTop = new Image();
  pipeTop.src = "../Assets/PipeTop.png";

  const pipeBot = new Image();
  pipeBot.src = "../Assets/PipeBot.png";

  const jumpSound = new Audio("../Assets/jump.mp3");
  jumpSound.volume = 0.25;

  const RAT_SCALE = 0.14;
  const PIPE_SCALE = 0.28;

  const GRAVITY = 0.22;
  const JUMP = -5.2;

  let PIPE_SPEED = 3.0;
  let GAP = 200;

  const SPAWN_FRAMES = 95;

  let rat;
  let obstacles = [];
  let frames = 0;
  let alive = true;
  let spaceHeld = false;
  let score = 0;
  let gameStarted = false;

  let loaded = 0;
  function onLoad() {
    loaded++;
    if (loaded === 4) startGame();
  }

  ratUp.onload = onLoad;
  ratDown.onload = onLoad;
  pipeTop.onload = onLoad;
  pipeBot.onload = onLoad;

  function resetGame() {
    const w = ratUp.width * RAT_SCALE;
    const h = ratUp.height * RAT_SCALE;

    rat = {
      x: 180,
      y: canvas.height / 2 - h / 2,
      w,
      h,
      vel: 0,
      angle: 0
    };

    obstacles = [];
    frames = 0;
    alive = true;
    score = 0;
    PIPE_SPEED = 3.0;
    GAP = 200;
    gameStarted = false;
  }

  function spawnObstacle() {
    const pipeW = pipeTop.width * PIPE_SCALE;
    const capH = pipeTop.height * PIPE_SCALE;

    const margin = 70;
    const minCenter = margin + GAP / 2;
    const maxCenter = canvas.height - margin - GAP / 2;
    const center = Math.random() * (maxCenter - minCenter) + minCenter;

    obstacles.push({
      x: canvas.width + pipeW,
      center,
      passed: false
    });
  }

  function update() {
    if (!alive) return;

    rat.vel += GRAVITY;
    rat.y += rat.vel;

    rat.angle = rat.vel * 0.1;
    if (rat.angle > 1.1) rat.angle = 1.1;
    if (rat.angle < -0.5) rat.angle = -0.5;

    if (rat.y <= 0 || rat.y + rat.h >= canvas.height) alive = false;

    const pipeW = pipeTop.width * PIPE_SCALE;

    obstacles.forEach(p => {
      p.x -= PIPE_SPEED;

      if (!p.passed && p.x + pipeW < rat.x) {
        p.passed = true;
        score++;
        PIPE_SPEED += 0.08;
        GAP -= 1.2;
        if (GAP < 130) GAP = 130;
      }
    });

    obstacles = obstacles.filter(p => p.x > -300);

    if (frames % SPAWN_FRAMES === 0) spawnObstacle();

    checkCollisions();
  }

  function checkCollisions() {
    const rx = rat.x;
    const ry = rat.y;
    const rw = rat.w;
    const rh = rat.h;

    const pipeW = pipeTop.width * PIPE_SCALE;
    const capH = pipeTop.height * PIPE_SCALE;

    obstacles.forEach(p => {
      const x = p.x;
      const center = p.center;

      const topCapY = center - GAP / 2 - capH;
      const topBodyY = 0;
      const topBodyH = topCapY + capH;

      const botCapY = center + GAP / 2;
      const botBodyY = botCapY;
      const botBodyH = canvas.height - botBodyY;

      const hitTop =
        rx < x + pipeW &&
        rx + rw > x &&
        ry < topBodyY + topBodyH &&
        ry + rh > topBodyY;

      const hitBottom =
        rx < x + pipeW &&
        rx + rw > x &&
        ry < botBodyY + botBodyH &&
        ry + rh > botBodyY;

      if (hitTop || hitBottom) alive = false;
    });
  }

  function drawBackground() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(canvas.width, 0);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.stroke();
  }

  function drawRat() {
    const img = spaceHeld ? ratUp : ratDown;

    ctx.save();
    ctx.translate(rat.x + rat.w / 2, rat.y + rat.h / 2);
    ctx.rotate(rat.angle);
    ctx.drawImage(img, -rat.w / 2, -rat.h / 2, rat.w, rat.h);
    ctx.restore();
  }

  function drawObstacles() {
    const pipeW = pipeTop.width * PIPE_SCALE;
    const capH = pipeTop.height * PIPE_SCALE;

    obstacles.forEach(p => {
      const x = p.x;
      const center = p.center;

      const topCapY = center - GAP / 2 - capH;
      const botCapY = center + GAP / 2;

      ctx.drawImage(pipeTop, x, topCapY, pipeW, capH);
      for (let y = topCapY - capH; y > -capH; y -= capH) {
        ctx.drawImage(pipeTop, x, y, pipeW, capH);
      }

      ctx.drawImage(pipeBot, x, botCapY, pipeW, capH);
      for (let y = botCapY + capH; y < canvas.height; y += capH) {
        ctx.drawImage(pipeBot, x, y, pipeW, capH);
      }
    });
  }

  function drawScore() {
    ctx.fillStyle = "black";
    ctx.font = "32px PressStart2P";
    ctx.textAlign = "center";
    ctx.fillText(score, canvas.width / 2, 70);
  }

  function draw() {
    drawBackground();
    drawObstacles();
    drawRat();
    drawScore();
  }

  function loop() {
    update();
    draw();
    frames++;
    requestAnimationFrame(loop);
  }

  function startGame() {
    resetGame();
    draw();
    loop();
  }

  function flap() {
    if (!gameStarted) {
      gameStarted = true;
    }
    if (alive) {
      rat.vel = JUMP;
      jumpSound.currentTime = 0;
      jumpSound.play();
    } else {
      resetGame();
      draw();
    }
  }

  document.addEventListener("keydown", e => {
    if (e.code === "Space") {
      spaceHeld = true;
      flap();
    }
  });

  document.addEventListener("keyup", e => {
    if (e.code === "Space") spaceHeld = false;
  });

  canvas.addEventListener("mousedown", () => {
    spaceHeld = true;
    flap();
  });

  canvas.addEventListener("mouseup", () => {
    spaceHeld = false;
  });

  canvas.addEventListener("touchstart", e => {
    e.preventDefault();
    spaceHeld = true;
    flap();
  });

  canvas.addEventListener("touchend", e => {
    e.preventDefault();
    spaceHeld = false;
  });
});

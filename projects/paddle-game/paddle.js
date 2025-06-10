const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let score = 0;
let highScore = localStorage.getItem('paddleHighScore') || 0;


const paddle = {
  width: 100,
  height: 15,
  x: canvas.width / 2 - 50, // Initial x position
  // y: canvas.height - paddle.height - 10, // The y position is fixed in drawPaddle
  speed: 7, // Speed for arrow key movement
  dx: 0,    // Delta x for arrow key movement
};

const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 10,
  speed: 4,
  dx: 4,
  dy: -4,
  maxSpeed: 20,
  accelerationFactor: 1.08
};

// Draw paddle
function drawPaddle() {
  ctx.fillStyle = "#fff";
  ctx.fillRect(paddle.x, canvas.height - paddle.height - 10, paddle.width, paddle.height);
}

// Draw ball
function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.closePath();
}

// Draw Score
function drawScore() {
  ctx.font = "20px Arial";
  ctx.fillStyle = "#fff";
  ctx.fillText("Score: " + score, 20, 30); // Position at top-left
  ctx.fillText("High Score: " + highScore, canvas.width - 150, 30); // Position at top-right
}

// Move paddle (for arrow key movement)
function movePaddle() {
  paddle.x += paddle.dx; // This is for arrow key movement

  // Stay within canvas (clamping) - This will also apply after mouse/touch sets paddle.x
  if (paddle.x < 0) {
    paddle.x = 0;
  }
  if (paddle.x + paddle.width > canvas.width) {
    paddle.x = canvas.width - paddle.width;
  }
}

// Move ball
function moveBall() {
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Wall collisions (left/right)
  if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
    ball.dx *= -1;
  }

  // Wall collisions (top)
  if (ball.y - ball.radius < 0) {
    ball.dy *= -1;
  }

  // Paddle collision
  if (
    ball.dy > 0 && // Only consider collision if ball is moving downwards
    ball.y + ball.radius >= canvas.height - paddle.height - 10 && // Ball's bottom edge at or below paddle's top
    ball.y + ball.radius <= canvas.height - 10 && // A bit of leeway, ensure it's not way past
    ball.x + ball.radius > paddle.x &&
    ball.x - ball.radius < paddle.x + paddle.width
  ) {
    ball.dy *= -1;
    score++;

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('paddleHighScore', highScore); // Save high score
    }

    // Accelerate the ball
    // Calculate current speed magnitude
    let currentSpeedMagnitude = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);

    if (currentSpeedMagnitude < ball.maxSpeed) {
        ball.dx *= ball.accelerationFactor;
        ball.dy *= ball.accelerationFactor; // dy is already negative here, so it will become more negative (faster up)

        // Cap speed if it exceeds maxSpeed after acceleration
        currentSpeedMagnitude = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy); // Recalculate
        if (currentSpeedMagnitude > ball.maxSpeed) {
            const ratio = ball.maxSpeed / currentSpeedMagnitude;
            ball.dx *= ratio;
            ball.dy *= ratio;
        }
    }
    // Add a small random horizontal variation to prevent overly repetitive bounces
    // ball.dx += (Math.random() - 0.5) * 0.5;
  }


  // Bottom collision - reset
  if (ball.y + ball.radius > canvas.height) {
    score = 0; // Reset score when ball is missed

    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    // Reset ball speed to initial speed, but maintain directionality from speed property
    const initialAngle = Math.atan2(ball.dy, ball.dx); // Keep angle, but use initial speed
    const randomSign = (Math.random() < 0.5 ? 1 : -1);
    ball.dx = randomSign * Math.cos(initialAngle) * ball.speed;
    // Ensure initial dy is upwards and uses ball.speed
    ball.dy = -Math.abs(Math.sin(initialAngle) * ball.speed);
    ball.dx = (Math.random() < 0.5 ? 1 : -1) * 4;
    ball.dy = -4;
  }
}

// Key handlers for arrow key movement
function keyDown(e) {
  if (e.key === "Right" || e.key === "ArrowRight") {
    paddle.dx = paddle.speed;
  } else if (e.key === "Left" || e.key === "ArrowLeft") {
    paddle.dx = -paddle.speed;
  }
}

function keyUp(e) {
  if (
    e.key === "Right" ||
    e.key === "ArrowRight" ||
    e.key === "Left" ||
    e.key === "ArrowLeft"
  ) {
    paddle.dx = 0;
  }
}

// Draw everything
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawPaddle();
  drawBall();
  drawScore();

  movePaddle();
  moveBall();

  requestAnimationFrame(draw);
}

// Start game
draw();

// --- MOUSE AND TOUCH HANDLING ---
function getGameCoordinates(event) {
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if (event.touches && event.touches.length > 0) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
    } else {
        clientX = event.clientX;
        clientY = event.clientY;
    }

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const gameX = (clientX - rect.left) * scaleX;
    const gameY = (clientY - rect.top) * scaleY;

    return { x: gameX, y: gameY };
}

// Mouse movement for paddle
canvas.addEventListener('mousemove', function(e) {
    const coords = getGameCoordinates(e);
    paddle.x = coords.x - (paddle.width / 2); // Set paddle.x directly
});

// Touch movement for paddle
canvas.addEventListener('touchmove', function(e) {
    e.preventDefault(); // Important to prevent page scrolling on canvas
    const coords = getGameCoordinates(e);
    paddle.x = coords.x - (paddle.width / 2); // Set paddle.x directly

    // Clamping handled in movePaddle()
}, { passive: false });

// Optional: Handle touch start to "grab" the paddle or for tap-to-move (more complex)
canvas.addEventListener('touchstart', function(e) {
    e.preventDefault();
}, { passive: false });


// Attach keyboard listeners
document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);
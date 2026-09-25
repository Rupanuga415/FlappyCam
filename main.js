const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Game State Variables
let gameStarted = false;
let gameOver = false;
let score = 0;
let highScore = 0;

// Bird Variables
const bird = {
    x: 50,
    y: 320,
    width: 34,
    height: 24,
    gravity: 0.25,
    velocity: 0,
    jump: 4.6,
    draw() {
        ctx.fillStyle = "#f7db11";
        ctx.fillRect(this.x, this.y, this.width, this.height);
        // Eye
        ctx.fillStyle = "#000";
        ctx.fillRect(this.x + 22, this.y + 4, 5, 5);
        // Beak
        ctx.fillStyle = "#f75311";
        ctx.fillRect(this.x + 28, this.y + 10, 6, 6);
    },
    update() {
        if (!gameStarted) return;
        this.velocity += this.gravity;
        this.y += this.velocity;

        // Floor collision
        if (this.y + this.height >= canvas.height) {
            this.y = canvas.height - this.height;
            endGame();
        }
        // Ceiling collision
        if (this.y <= 0) {
            this.y = 0;
            this.velocity = 0;
        }
    },
    flap() {
        if (gameOver) {
            resetGame();
            return;
        }
        if (!gameStarted) gameStarted = true;
        this.velocity = -this.jump;
    },
};

window.birdFlap = function () {
    bird.flap();
};

// Pipe Variables
const pipes = [];
const pipeWidth = 64;
const pipeGap = 120;
const pipeSpeed = 2;
let pipeTimer = 0;

function spawnPipe() {
    const minHeight = 50;
    const maxHeight = canvas.height - pipeGap - minHeight;
    const topHeight =
        Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;

    pipes.push({
        x: canvas.width,
        topHeight: topHeight,
        bottomY: topHeight + pipeGap,
        passed: false,
    });
}

function drawPipes() {
    ctx.fillStyle = "#73bf2e";
    pipes.forEach((pipe) => {
        // Top Pipe
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);
        // Bottom Pipe
        ctx.fillRect(
            pipe.x,
            pipe.bottomY,
            pipeWidth,
            canvas.height - pipe.bottomY,
        );
    });
}

function updatePipes() {
    if (!gameStarted || gameOver) return;

    pipeTimer++;
    if (pipeTimer % 100 === 0) {
        spawnPipe();
    }

    for (let i = pipes.length - 1; i >= 0; i--) {
        pipes[i].x -= pipeSpeed;

        // Collision Detection
        if (
            bird.x < pipes[i].x + pipeWidth &&
            bird.x + bird.width > pipes[i].x &&
            (bird.y < pipes[i].topHeight ||
                bird.y + bird.height > pipes[i].bottomY)
        ) {
            endGame();
        }

        // Score Update
        if (!pipes[i].passed && pipes[i].x + pipeWidth < bird.x) {
            score++;
            pipes[i].passed = true;
        }

        // Remove off-screen pipes
        if (pipes[i].x + pipeWidth < 0) {
            pipes.splice(i, 1);
        }
    }
}

// Interface UI Drawings
function drawUI() {
    ctx.fillStyle = "#000000";
    ctx.font = "24px Arial";
    ctx.textAlign = "center";

    if (!gameStarted && !gameOver) {
        ctx.fillText(
            "PRESS SPACE OR TAP",
            canvas.width / 2,
            canvas.height / 2 - 20,
        );
        ctx.fillText(
            "TO FLAP & START",
            canvas.width / 2,
            canvas.height / 2 + 20,
        );
    }

    if (gameStarted && !gameOver) {
        ctx.font = "40px Arial";
        ctx.fillText(score, canvas.width / 2, 80);
    }

    if (gameOver) {
        ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 60);
        ctx.font = "30px Arial";
        ctx.fillText(
            `Score: ${score}`,
            canvas.width / 2,
            canvas.height / 2 - 10,
        );
        ctx.fillText(
            `Best: ${highScore}`,
            canvas.width / 2,
            canvas.height / 2 + 30,
        );
        ctx.font = "20px Arial";
        ctx.fillText(
            "PRESS SPACE TO RESTART",
            canvas.width / 2,
            canvas.height / 2 + 80,
        );
    }
}

function endGame() {
    gameOver = true;
    if (score > highScore) {
        highScore = score;
    }
}

function resetGame() {
    bird.y = 320;
    bird.velocity = 0;
    pipes.length = 0;
    score = 0;
    pipeTimer = 0;
    gameOver = false;
    gameStarted = false;
}

// Game Loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    bird.update();
    updatePipes();

    bird.draw();
    drawPipes();
    drawUI();

    requestAnimationFrame(gameLoop);
}

// Controls
window.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
        bird.flap();
        e.preventDefault(); // Prevent page scrolling
    }
});

window.addEventListener(
    "touchstart",
    (e) => {
        // Only flap if the user actually touched the canvas area
        if (e.target === canvas) {
            bird.flap();
            e.preventDefault();
        }
    },
    { passive: false },
);

// Start Loop
requestAnimationFrame(gameLoop);

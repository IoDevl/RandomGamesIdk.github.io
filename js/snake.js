class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.canvas.width = 400;
        this.canvas.height = 400;
        
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        this.snake = [{x: 10, y: 10}];
        this.food = this.generateFood();
        this.direction = {x: 0, y: 0};
        this.nextDirection = {x: 1, y: 0};
        this.score = 0;
        this.highScore = localStorage.getItem('snakeHighScore') || 0;
        this.gameSpeed = 150;
        this.gameLoop = null;
        this.isPaused = false;
        this.isGameOver = false;

        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('highScore');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.restartBtn = document.getElementById('restartBtn');
        this.gameOverScreen = document.querySelector('.game-over');
        this.finalScoreElement = document.getElementById('finalScore');

        this.highScoreElement.textContent = this.highScore;

        this.initializeControls();
        
        this.draw();
    }

    initializeControls() {
        document.addEventListener('keydown', (e) => {
            this.handleKeyPress(e.key);
        });

        const touchButtons = {
            'upBtn': {x: 0, y: -1},
            'downBtn': {x: 0, y: 1},
            'leftBtn': {x: -1, y: 0},
            'rightBtn': {x: 1, y: 0}
        };

        Object.entries(touchButtons).forEach(([id, dir]) => {
            document.getElementById(id)?.addEventListener('click', () => {
                if (!this.isOppositeDirection(dir)) {
                    this.nextDirection = dir;
                }
            });
        });

        this.startBtn.addEventListener('click', () => this.startGame());
        this.pauseBtn.addEventListener('click', () => this.togglePause());
        this.restartBtn.addEventListener('click', () => this.resetGame());
    }

    handleKeyPress(key) {
        const directions = {
            'ArrowUp': {x: 0, y: -1},
            'ArrowDown': {x: 0, y: 1},
            'ArrowLeft': {x: -1, y: 0},
            'ArrowRight': {x: 1, y: 0},
            'w': {x: 0, y: -1},
            'W': {x: 0, y: -1},
            's': {x: 0, y: 1},
            'S': {x: 0, y: 1},
            'a': {x: -1, y: 0},
            'A': {x: -1, y: 0},
            'd': {x: 1, y: 0},
            'D': {x: 1, y: 0}
        };

        if (directions[key] && !this.isOppositeDirection(directions[key])) {
            this.nextDirection = directions[key];
        }
    }

    isOppositeDirection(newDir) {
        return (this.direction.x === -newDir.x && this.direction.y === -newDir.y) ||
               (this.direction.x === newDir.x && this.direction.y === newDir.y);
    }

    generateFood() {
        let position;
        do {
            position = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
        } while (this.snake.some(segment => segment.x === position.x && segment.y === position.y));
        return position;
    }

    update() {
        if (this.isPaused || this.isGameOver) return;

        this.direction = {...this.nextDirection};

        const newHead = {
            x: this.snake[0].x + this.direction.x,
            y: this.snake[0].y + this.direction.y
        };

        if (this.checkCollision(newHead)) {
            this.gameOver();
            return;
        }

        this.snake.unshift(newHead);

        if (newHead.x === this.food.x && newHead.y === this.food.y) {
            this.score += 10;
            this.scoreElement.textContent = this.score;
            this.food = this.generateFood();
            this.increaseSpeed();
        } else {
            this.snake.pop();
        }
    }

    checkCollision(position) {
        if (position.x < 0 || position.x >= this.tileCount ||
            position.y < 0 || position.y >= this.tileCount) {
            return true;
        }

        return this.snake.some(segment => segment.x === position.x && segment.y === position.y);
    }

    draw() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.strokeStyle = 'rgba(0, 255, 136, 0.1)';
        for (let i = 0; i < this.tileCount; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.gridSize, 0);
            this.ctx.lineTo(i * this.gridSize, this.canvas.height);
            this.ctx.stroke();
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.gridSize);
            this.ctx.lineTo(this.canvas.width, i * this.gridSize);
            this.ctx.stroke();
        }

        this.ctx.fillStyle = '#6c00ff';
        this.ctx.beginPath();
        this.ctx.arc(
            (this.food.x + 0.5) * this.gridSize,
            (this.food.y + 0.5) * this.gridSize,
            this.gridSize / 2.5,
            0,
            Math.PI * 2
        );
        this.ctx.fill();

        this.snake.forEach((segment, index) => {
            const gradient = this.ctx.createLinearGradient(
                segment.x * this.gridSize,
                segment.y * this.gridSize,
                (segment.x + 1) * this.gridSize,
                (segment.y + 1) * this.gridSize
            );
            gradient.addColorStop(0, '#00ff88');
            gradient.addColorStop(1, '#00ffaa');
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(
                segment.x * this.gridSize + 1,
                segment.y * this.gridSize + 1,
                this.gridSize - 2,
                this.gridSize - 2
            );

            if (index === 0) {
                this.ctx.fillStyle = '#000';
                const eyeSize = this.gridSize / 8;
                const eyeOffset = this.gridSize / 4;
                
                this.ctx.beginPath();
                this.ctx.arc(
                    (segment.x + 0.3) * this.gridSize,
                    (segment.y + 0.3) * this.gridSize,
                    eyeSize,
                    0,
                    Math.PI * 2
                );
                this.ctx.arc(
                    (segment.x + 0.7) * this.gridSize,
                    (segment.y + 0.3) * this.gridSize,
                    eyeSize,
                    0,
                    Math.PI * 2
                );
                this.ctx.fill();
            }
        });
    }

    increaseSpeed() {
        if (this.gameSpeed > 50) {
            this.gameSpeed -= 5;
            if (this.gameLoop) {
                clearInterval(this.gameLoop);
                this.gameLoop = setInterval(() => {
                    this.update();
                    this.draw();
                }, this.gameSpeed);
            }
        }
    }

    startGame() {
        if (this.gameLoop) return;
        
        this.resetGame();
        this.direction = {x: 1, y: 0};
        this.nextDirection = {x: 1, y: 0};
        this.gameLoop = setInterval(() => {
            this.update();
            this.draw();
        }, this.gameSpeed);
        
        this.startBtn.style.display = 'none';
        this.pauseBtn.style.display = 'inline-block';
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        this.pauseBtn.textContent = this.isPaused ? 'Resume' : 'Pause';
    }

    gameOver() {
        this.isGameOver = true;
        clearInterval(this.gameLoop);
        this.gameLoop = null;
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeHighScore', this.highScore);
            this.highScoreElement.textContent = this.highScore;
        }
        
        this.finalScoreElement.textContent = this.score;
        this.gameOverScreen.style.display = 'block';
        this.startBtn.style.display = 'inline-block';
        this.pauseBtn.style.display = 'none';
    }

    resetGame() {
        this.snake = [{x: 10, y: 10}];
        this.food = this.generateFood();
        this.direction = {x: 1, y: 0};
        this.nextDirection = {x: 1, y: 0};
        this.score = 0;
        this.gameSpeed = 150;
        this.isPaused = false;
        this.isGameOver = false;
        
        this.scoreElement.textContent = '0';
        this.gameOverScreen.style.display = 'none';
        this.pauseBtn.textContent = 'Pause';
        
        this.draw();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SnakeGame();
});
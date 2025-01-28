class Minesweeper {
    constructor() {
        this.difficulties = {
            beginner: { rows: 9, cols: 9, mines: 10 },
            intermediate: { rows: 16, cols: 16, mines: 40 },
            expert: { rows: 16, cols: 30, mines: 99 }
        };
        
        this.currentDifficulty = 'beginner';
        this.board = [];
        this.mineLocations = new Set();
        this.flaggedCells = new Set();
        this.revealedCells = new Set();
        this.isGameOver = false;
        this.isFirstClick = true;
        this.timer = 0;
        this.timerInterval = null;

        this.initializeElements();
        this.initializeGame();
    }

    initializeElements() {
        this.gameBoard = document.getElementById('gameBoard');
        this.minesLeftDisplay = document.getElementById('minesLeft');
        this.timerDisplay = document.getElementById('timer');
        this.resetBtn = document.getElementById('resetBtn');
        this.difficultyBtns = document.querySelectorAll('.difficulty-btn');
        this.gameOverScreen = document.querySelector('.game-over');
        this.gameWonScreen = document.querySelector('.game-won');
        this.playAgainBtn = document.getElementById('playAgainBtn');
        this.newGameBtn = document.getElementById('newGameBtn');
        this.finalTimeDisplay = document.getElementById('finalTime');
        this.winTimeDisplay = document.getElementById('winTime');

        this.resetBtn.addEventListener('click', () => this.resetGame());
        this.playAgainBtn.addEventListener('click', () => this.resetGame());
        this.newGameBtn.addEventListener('click', () => this.resetGame());

        this.difficultyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.difficultyBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentDifficulty = btn.dataset.difficulty;
                this.resetGame();
            });
        });
    }

    initializeGame() {
        const { rows, cols, mines } = this.difficulties[this.currentDifficulty];
        this.rows = rows;
        this.cols = cols;
        this.totalMines = mines;
        this.minesLeft = mines;
        this.minesLeftDisplay.textContent = this.minesLeft;

        const cellSize = this.currentDifficulty === 'expert' ? 22 : 25;
        this.gameBoard.style.gridTemplateColumns = `repeat(${cols}, ${cellSize}px)`;
        this.createBoard();
    }

    createBoard() {
        this.gameBoard.innerHTML = '';
        this.board = Array(this.rows).fill().map(() => Array(this.cols).fill(0));

        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = i;
                cell.dataset.col = j;

                cell.addEventListener('click', (e) => this.handleClick(e, i, j));
                cell.addEventListener('contextmenu', (e) => this.handleRightClick(e, i, j));

                this.gameBoard.appendChild(cell);
            }
        }
    }

    placeMines(firstClickRow, firstClickCol) {
        this.mineLocations.clear();
        const totalCells = this.rows * this.cols;

        while (this.mineLocations.size < this.totalMines) {
            const position = Math.floor(Math.random() * totalCells);
            const row = Math.floor(position / this.cols);
            const col = position % this.cols;

            if (Math.abs(row - firstClickRow) <= 1 && Math.abs(col - firstClickCol) <= 1) {
                continue;
            }

            const positionString = `${row},${col}`;
            if (!this.mineLocations.has(positionString)) {
                this.mineLocations.add(positionString);
                this.board[row][col] = 'M';
            }
        }

        this.calculateNumbers();
    }

    calculateNumbers() {
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.board[row][col] === 'M') continue;

                let count = 0;
                for (let [dx, dy] of directions) {
                    const newRow = row + dx;
                    const newCol = col + dy;
                    if (newRow >= 0 && newRow < this.rows && 
                        newCol >= 0 && newCol < this.cols && 
                        this.board[newRow][newCol] === 'M') {
                        count++;
                    }
                }
                this.board[row][col] = count;
            }
        }
    }

    handleClick(e, row, col) {
        e.preventDefault();
        if (this.isGameOver || this.flaggedCells.has(`${row},${col}`)) return;

        if (this.isFirstClick) {
            this.startTimer();
            this.placeMines(row, col);
            this.isFirstClick = false;
        }

        this.revealCell(row, col);

        if (this.checkWin()) {
            this.handleWin();
        }
    }

    handleRightClick(e, row, col) {
        e.preventDefault();
        if (this.isGameOver || this.revealedCells.has(`${row},${col}`)) return;

        const positionString = `${row},${col}`;
        const cell = this.gameBoard.children[row * this.cols + col];

        if (this.flaggedCells.has(positionString)) {
            this.flaggedCells.delete(positionString);
            cell.textContent = '';
            cell.classList.remove('flagged');
            this.minesLeft++;
        } else {
            this.flaggedCells.add(positionString);
            cell.textContent = '🚩';
            cell.classList.add('flagged');
            this.minesLeft--;
        }

        this.minesLeftDisplay.textContent = this.minesLeft;
    }

    revealCell(row, col) {
        const positionString = `${row},${col}`;
        if (this.revealedCells.has(positionString)) return;

        const cell = this.gameBoard.children[row * this.cols + col];
        this.revealedCells.add(positionString);
        cell.classList.add('revealed');

        if (this.board[row][col] === 'M') {
            this.handleGameOver(cell);
            return;
        }

        if (this.board[row][col] > 0) {
            cell.textContent = this.board[row][col];
            cell.dataset.number = this.board[row][col];
            return;
        }

        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];

        for (let [dx, dy] of directions) {
            const newRow = row + dx;
            const newCol = col + dy;
            if (newRow >= 0 && newRow < this.rows && 
                newCol >= 0 && newCol < this.cols) {
                this.revealCell(newRow, newCol);
            }
        }
    }

    handleGameOver(mineCell) {
        this.isGameOver = true;
        this.stopTimer();
        this.resetBtn.textContent = '😵';
        mineCell.textContent = '💥';
        mineCell.classList.add('mine');

        this.mineLocations.forEach(pos => {
            const [row, col] = pos.split(',').map(Number);
            const cell = this.gameBoard.children[row * this.cols + col];
            if (!cell.classList.contains('flagged')) {
                cell.textContent = '💣';
                cell.classList.add('revealed', 'mine');
            }
        });

        this.finalTimeDisplay.textContent = this.timer;
        this.gameOverScreen.style.display = 'block';
    }

    handleWin() {
        this.isGameOver = true;
        this.stopTimer();
        this.resetBtn.textContent = '😎';
        
        this.winTimeDisplay.textContent = this.timer;
        this.gameWonScreen.style.display = 'block';
    }

    checkWin() {
        const totalCells = this.rows * this.cols;
        return this.revealedCells.size === totalCells - this.totalMines;
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.timerDisplay.textContent = this.timer;
        }, 1000);
    }

    stopTimer() {
        clearInterval(this.timerInterval);
    }

    resetGame() {
        this.stopTimer();
        this.timer = 0;
        this.timerDisplay.textContent = '0';
        this.isGameOver = false;
        this.isFirstClick = true;
        this.mineLocations.clear();
        this.flaggedCells.clear();
        this.revealedCells.clear();
        this.resetBtn.textContent = '😊';
        this.gameOverScreen.style.display = 'none';
        this.gameWonScreen.style.display = 'none';
        this.initializeGame();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Minesweeper();
});
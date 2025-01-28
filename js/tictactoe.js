class TicTacToe {
    constructor() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameMode = 'local';
        this.difficulty = 'easy';
        this.gameActive = true;
        this.isWaitingForAI = false;
        this.aiMoveTimeout = null;
        this.winningCombos = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6] // Diagonals
        ];

        this.initializeGame();
    }

    initializeGame() {
        this.cells = document.querySelectorAll('.cell');
        this.statusText = document.querySelector('.status-text');
        this.resetButton = document.querySelector('.reset-btn');
        this.modeButtons = document.querySelectorAll('.mode-btn');
        this.difficultyButtons = document.querySelectorAll('.difficulty-btn');
        this.difficultySelect = document.querySelector('.difficulty-select');

        this.cells.forEach(cell => {
            cell.addEventListener('click', () => this.handleCellClick(cell));
        });

        this.resetButton.addEventListener('click', () => this.resetGame());

        this.modeButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.modeButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                this.gameMode = button.dataset.mode;
                this.difficultySelect.style.display = this.gameMode === 'ai' ? 'block' : 'none';
                this.resetGame();
            });
        });

        this.difficultyButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.difficultyButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                this.difficulty = button.dataset.difficulty;
                this.resetGame();
            });
        });
    }

    handleCellClick(cell) {
        const index = cell.dataset.index;
        if (this.board[index] === '' && this.gameActive && !this.isWaitingForAI) {
            this.makeMove(index);
            
            if (this.gameMode === 'ai' && this.gameActive && this.currentPlayer === 'O') {
                this.isWaitingForAI = true;
                this.aiMoveTimeout = setTimeout(() => this.makeAIMove(), 500);
            }
        }
    }

    makeMove(index) {
        this.board[index] = this.currentPlayer;
        this.cells[index].textContent = this.currentPlayer;
        this.cells[index].classList.add(this.currentPlayer.toLowerCase());

        if (this.checkWin()) {
            this.statusText.textContent = `Player ${this.currentPlayer} wins!`;
            this.gameActive = false;
            return;
        }

        if (this.checkDraw()) {
            this.statusText.textContent = "It's a draw!";
            this.gameActive = false;
            return;
        }

        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.statusText.textContent = `Player ${this.currentPlayer}'s turn`;
    }

    makeAIMove() {
        let move;
        switch (this.difficulty) {
            case 'impossible':
                move = this.getBestMove();
                break;
            case 'hard':
                move = Math.random() < 0.8 ? this.getBestMove() : this.getRandomMove();
                break;
            case 'medium':
                move = Math.random() < 0.5 ? this.getBestMove() : this.getRandomMove();
                break;
            default: // easy
                move = this.getRandomMove();
        }
        this.makeMove(move);
        this.isWaitingForAI = false;
    }

    getBestMove() {
        let bestScore = -Infinity;
        let bestMove;
        
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                this.board[i] = 'O';
                let score = this.minimax(this.board, 0, false);
                this.board[i] = '';
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }
        return bestMove;
    }

    minimax(board, depth, isMaximizing) {
        let result = this.checkGameEnd();
        if (result !== null) {
            return result === 'O' ? 10 - depth : result === 'X' ? depth - 10 : 0;
        }

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = 'O';
                    let score = this.minimax(board, depth + 1, false);
                    board[i] = '';
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = 'X';
                    let score = this.minimax(board, depth + 1, true);
                    board[i] = '';
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    }

    getRandomMove() {
        const emptyCells = this.board
            .map((cell, index) => cell === '' ? index : null)
            .filter(cell => cell !== null);
        return emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }

    checkWin() {
        return this.winningCombos.some(combo => {
            return combo.every(index => {
                return this.board[index] === this.currentPlayer;
            });
        });
    }

    checkDraw() {
        return this.board.every(cell => cell !== '');
    }

    checkGameEnd() {
        for (let combo of this.winningCombos) {
            if (this.board[combo[0]] && 
                this.board[combo[0]] === this.board[combo[1]] && 
                this.board[combo[0]] === this.board[combo[2]]) {
                return this.board[combo[0]];
            }
        }
        return this.board.includes('') ? null : 'draw';
    }

    resetGame() {
        if (this.aiMoveTimeout) {
            clearTimeout(this.aiMoveTimeout);
            this.aiMoveTimeout = null;
        }
        
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.isWaitingForAI = false;
        this.cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('x', 'o');
        });
        this.statusText.textContent = "Player X's turn";
    }
}

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TicTacToe();
}); 
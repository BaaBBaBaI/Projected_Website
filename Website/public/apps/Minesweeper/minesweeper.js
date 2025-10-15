class MinesweeperGame {
    constructor(container, difficulty = 'Beginner') {
        this.container = container;
        this.difficulty = difficulty;
        this.status = 'new';
        this.cells = [];
        this.seconds = 0;
        this.timer = null;
        
        this.CONFIG = {
            Beginner: { rows: 9, columns: 9, mines: 10 },
            Intermediate: { rows: 16, columns: 16, mines: 40 },
            Expert: { rows: 30, columns: 16, mines: 99 }
        };
        
        this.init();
    }
    
    init() {
        const config = this.CONFIG[this.difficulty];
        this.rows = config.rows;
        this.columns = config.columns;
        this.mines = config.mines;
        this.status = 'new';
        this.seconds = 0;
        this.stopTimer();
        
        // Create empty cells
        this.cells = Array(this.rows * this.columns).fill(null).map(() => ({
            state: 'cover',
            minesAround: 0
        }));
        
        this.setupHTML();
        this.render();
    }

    setupHTML() {
        this.container.innerHTML = `
        <div class="minesweeper-game">
            <div class="mine-header">
                <div class="mine-counter"></div>
                <button class="mine-face"></button>
                <div class="mine-timer"></div>
            </div>
            <div class="mine-board"></div>
        </div>
        <div class="mine-controls">
                <button data-level="Beginner">Beginner</button>
                <button data-level="Intermediate">Intermediate</button>
                <button data-level="Expert">Expert</button>
            </div>
    `;

        // Event listeners...
        this.container.querySelector('.mine-face').addEventListener('click', () => this.reset());

        this.container.querySelectorAll('[data-level]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.difficulty = e.target.dataset.level;
                this.init();
            });
        });

        const board = this.container.querySelector('.mine-board');
        board.addEventListener('click', (e) => this.handleClick(e));
        board.addEventListener('contextmenu', (e) => this.handleRightClick(e));
    }
    
    handleClick(e) {
        if (!e.target.classList.contains('mine-cell')) return;
        const index = parseInt(e.target.dataset.index);
        this.openCell(index);
    }
    
    handleRightClick(e) {
        e.preventDefault();
        if (!e.target.classList.contains('mine-cell')) return;
        const index = parseInt(e.target.dataset.index);
        this.toggleFlag(index);
    }

    startGame(excludeIndex) {
        // Clear previous mines
        this.cells.forEach(cell => {
            cell.minesAround = 0;
        });

        // Use Fisher-Yates shuffle for better distribution
        const totalCells = this.rows * this.columns;
        const availableIndexes = [];

        for (let i = 0; i < totalCells; i++) {
            // Exclude clicked cell and its neighbors for first click
            if (i !== excludeIndex && !this.getNearIndexes(excludeIndex).includes(i)) {
                availableIndexes.push(i);
            }
        }

        // Shuffle array properly
        for (let i = availableIndexes.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [availableIndexes[i], availableIndexes[j]] = [availableIndexes[j], availableIndexes[i]];
        }

        // Take first N positions for mines
        const mineIndexes = availableIndexes.slice(0, this.mines);

        // Place mines
        mineIndexes.forEach(index => {
            this.cells[index].minesAround = -10; // Mark as mine
        });

        // Calculate numbers for all non-mine cells
        for (let i = 0; i < totalCells; i++) {
            if (this.cells[i].minesAround < 0) continue; // Skip mines

            const neighbors = this.getNearIndexes(i);
            let count = 0;

            neighbors.forEach(neighborIndex => {
                if (this.cells[neighborIndex].minesAround < 0) {
                    count++;
                }
            });

            this.cells[i].minesAround = count;
        }

        this.status = 'started';
        this.startTimer();
    }
    
    openCell(index) {
        const cell = this.cells[index];
        
        if (this.status === 'new') {
            this.startGame(index);
        }
        
        if (['flag', 'open'].includes(cell.state) || ['won', 'died'].includes(this.status)) {
            return;
        }
        
        if (cell.minesAround < 0) {
            this.gameOver(index);
            return;
        }
        
        // Open cell and flood fill
        const toOpen = this.getOpenCells(index);
        toOpen.forEach(i => {
            this.cells[i].state = 'open';
        });
        
        this.checkWin();
        this.render();
    }
    
    getOpenCells(index) {
        const visited = new Set();
        const result = [];
        
        const walk = (idx) => {
            const cell = this.cells[idx];
            if (visited.has(idx) || cell.minesAround < 0 || cell.state === 'flag') {
                return;
            }
            
            visited.add(idx);
            result.push(idx);
            
            if (cell.minesAround === 0) {
                this.getNearIndexes(idx).forEach(nearIdx => walk(nearIdx));
            }
        };
        
        walk(index);
        return result;
    }
    
    toggleFlag(index) {
        const cell = this.cells[index];
        
        if (cell.state === 'open' || ['won', 'died'].includes(this.status)) {
            return;
        }
        
        if (cell.state === 'cover') {
            cell.state = 'flag';
        } else if (cell.state === 'flag') {
            cell.state = 'unknown';
        } else {
            cell.state = 'cover';
        }
        
        this.render();
    }
    
    gameOver(index) {
        this.stopTimer();
        this.status = 'died';
        
        this.cells.forEach((cell, i) => {
            if (cell.minesAround < 0 && cell.state !== 'flag') {
                cell.state = i === index ? 'die' : 'mine';
            } else if (cell.state === 'flag' && cell.minesAround >= 0) {
                cell.state = 'misflagged';
            }
        });
        
        this.render();
    }
    
    checkWin() {
        const unopened = this.cells.filter(c => 
            c.state !== 'open' && c.minesAround >= 0
        ).length;
        
        if (unopened === 0) {
            this.stopTimer();
            this.status = 'won';
            
            this.cells.forEach(cell => {
                if (cell.minesAround < 0) cell.state = 'flag';
            });
        }
    }
    
    getNearIndexes(index) {
        const row = Math.floor(index / this.columns);
        const column = index % this.columns;
        
        const neighbors = [];
        
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                
                const newRow = row + dr;
                const newCol = column + dc;
                
                if (newRow >= 0 && newRow < this.rows && 
                    newCol >= 0 && newCol < this.columns) {
                    neighbors.push(newRow * this.columns + newCol);
                }
            }
        }
        
        return neighbors;
    }

    startTimer() {
        this.stopTimer();
        this.timer = setInterval(() => {
            this.seconds = Math.min(this.seconds + 1, 999);
            this.updateDisplay(); // This now uses digit sprites
        }, 1000);
    }

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
    
    updateDisplay() {
        const timer = this.container.querySelector('.mine-timer');
        if (timer) {
            this.updateDigitDisplay(timer, this.seconds);
        }
    }
    
    getRemainingMines() {
        const flagged = this.cells.filter(c => c.state === 'flag').length;
        return Math.max(0, this.mines - flagged);
    }

    render() {
        const board = this.container.querySelector('.mine-board');
        const counter = this.container.querySelector('.mine-counter');
        const timer = this.container.querySelector('.mine-timer');
        const face = this.container.querySelector('.mine-face');

        // Update mine counter with digit sprites
        const remaining = Math.max(-99, Math.min(999, this.getRemainingMines()));
        this.updateDigitDisplay(counter, remaining);

        // Update timer with digit sprites
        this.updateDigitDisplay(timer, this.seconds);

        // Update face image
        const faceImages = {
            new: 'smile.png',
            started: 'smile.png',
            died: 'dead.png',
            won: 'win.png'
        };
        face.style.backgroundImage = `url('../../assets/minesweeper/${faceImages[this.status]}')`;

        // Render board
        board.style.gridTemplateColumns = `repeat(${this.columns}, 16px)`;
        board.innerHTML = '';

        this.cells.forEach((cell, index) => {
            const div = document.createElement('div');
            div.className = `mine-cell mine-${cell.state}`;
            div.dataset.index = index;

            if (cell.state === 'open' && cell.minesAround > 0) {
                div.dataset.num = cell.minesAround;
            }

            board.appendChild(div);
        });
    }

// Add helper method for digit displays
    updateDigitDisplay(container, value) {
        const digits = String(Math.abs(value)).padStart(3, '0').split('');

        container.innerHTML = '';

        if (value < 0) {
            const minus = document.createElement('div');
            minus.className = 'digit-display';
            minus.style.backgroundImage = "url('../../assets/minesweeper/digit-.png')";
            container.appendChild(minus);
        }

        digits.slice(value < 0 ? 1 : 0).forEach(digit => {
            const digitEl = document.createElement('div');
            digitEl.className = 'digit-display';
            digitEl.style.backgroundImage = `url('../../assets/minesweeper/digit${digit}.png')`;
            container.appendChild(digitEl);
        });
    }

    
    getNumberColor(num) {
        const colors = ['', '#0000ff', '#008000', '#ff0000', '#000080', 
                       '#800000', '#008080', '#000000', '#808080'];
        return colors[num] || '#000';
    }
    
    reset() {
        this.init();
    }
    
    destroy() {
        this.stopTimer();
    }
}


const GRID_SIZE = 4;
const GRID_CELLS = GRID_SIZE * GRID_SIZE;
const WINNING_VALUE = 2048;

let grid;
let score;
let gameOver;

document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.querySelector('.start-game');
    const restartButton = document.querySelector('.restart-game');
    const toggleThemeButton = document.querySelector('.toggle-theme');
    const gameOverContainer = document.querySelector('.game-over');
    const gridContainer = document.querySelector('.grid');
    let gameStarted = false;
    const themes = ['light', 'blue', 'purple', 'red', 'green'];
    let currentThemeIndex = 0;

    startButton.addEventListener('click', () => {
        if (!gameStarted) {
            startGame();
            gameStarted = true;
        }
    });

    restartButton.addEventListener('click', () => {
        resetGame();
        startGame();
    });

    toggleThemeButton.addEventListener('click', () => {
        currentThemeIndex = (currentThemeIndex + 1) % themes.length;
        document.body.className = '';
        document.body.classList.add(`${themes[currentThemeIndex]}-theme`);
    });

    function startGame() {
        // 初始化游戏逻辑
        gridContainer.style.display = 'grid';
        gameOverContainer.style.display = 'none';
        initGame();
    }

    function resetGame() {
        // 重置游戏逻辑
        initGame();
    }

    function endGame() {
        gameOverContainer.style.display = 'block';
        gridContainer.style.display = 'none';
        gameStarted = false;
    }

    document.addEventListener('keydown', handleKeyPress);
    document.querySelector('.game-over button').addEventListener('click', initGame);
});

function initGame() {
    grid = Array(GRID_CELLS).fill(0);
    score = 0;
    gameOver = false;
    
    updateScore();
    document.querySelector('.game-over').style.display = 'none';
    document.querySelector('.grid').innerHTML = '';
    
    for (let i = 0; i < GRID_CELLS; i++) {
        const cell = document.createElement('div');
        document.querySelector('.grid').appendChild(cell);
    }
    
    addRandomTile();
    addRandomTile();
    updateGrid();
}

function addRandomTile() {
    const emptyCells = grid
        .map((value, index) => value === 0 ? index : null)
        .filter(index => index !== null);
    
    if (emptyCells.length > 0) {
        const randomIndex = emptyCells.splice(Math.floor(Math.random() * emptyCells.length), 1)[0];
        grid[randomIndex] = Math.random() < 0.9 ? 2 : 4;
    }
}

function updateGrid() {
    grid.forEach((value, index) => {
        const cell = document.querySelector(`.grid div:nth-child(${index + 1})`);
        cell.textContent = value > 0 ? value : '';
        cell.style.backgroundColor = getTileColor(value);
    });
    updateScore();
}

function getTileColor(value) {
    const colors = {
        0: '#cdc1b4',
        2: '#eee4da',
        4: '#ede0c8',
        8: '#f2b179',
        16: '#f59563',
        32: '#f67c5f',
        64: '#f65e3b',
        128: '#edcf72',
        256: '#edcc61',
        512: '#edc850',
        1024: '#edc53f',
        2048: '#edc22e'
    };
    return colors[value] || '#3c3a32';
}

function updateScore() {
    document.querySelector('.score').textContent = score;
}

function handleKeyPress(event) {
    if (gameOver) return;
    
    const keyActions = {
        'ArrowLeft': moveLeft,
        'ArrowRight': moveRight,
        'ArrowUp': moveUp,
        'ArrowDown': moveDown
    };
    
    if (keyActions[event.key]) {
        event.preventDefault();
        const moved = keyActions[event.key]();
        if (moved) {
            addRandomTile();
            updateGrid();
            checkGameOver();
        }
    }
}

function moveLeft() {
    let moved = false;
    for (let row = 0; row < GRID_SIZE; row++) {
        const tiles = grid.slice(row * GRID_SIZE, (row + 1) * GRID_SIZE);
        const newTiles = slideAndMerge(tiles);
        if (tiles.toString() !== newTiles.toString()) {
            moved = true;
            grid.splice(row * GRID_SIZE, GRID_SIZE, ...newTiles);
        }
    }
    return moved;
}

function moveRight() {
    let moved = false;
    for (let row = 0; row < GRID_SIZE; row++) {
        const tiles = grid.slice(row * GRID_SIZE, (row + 1) * GRID_SIZE).reverse();
        const newTiles = slideAndMerge(tiles).reverse();
        if (tiles.toString() !== newTiles.toString()) {
            moved = true;
            grid.splice(row * GRID_SIZE, GRID_SIZE, ...newTiles);
        }
    }
    return moved;
}

function moveUp() {
    let moved = false;
    for (let col = 0; col < GRID_SIZE; col++) {
        const tiles = [];
        for (let row = 0; row < GRID_SIZE; row++) {
            tiles.push(grid[row * GRID_SIZE + col]);
        }
        const newTiles = slideAndMerge(tiles);
        if (tiles.toString() !== newTiles.toString()) {
            moved = true;
            for (let row = 0; row < GRID_SIZE; row++) {
                grid[row * GRID_SIZE + col] = newTiles[row];
            }
        }
    }
    return moved;
}

function moveDown() {
    let moved = false;
    for (let col = 0; col < GRID_SIZE; col++) {
        const tiles = [];
        for (let row = GRID_SIZE - 1; row >= 0; row--) {
            tiles.push(grid[row * GRID_SIZE + col]);
        }
        const newTiles = slideAndMerge(tiles);
        if (tiles.toString() !== newTiles.toString()) {
            moved = true;
            for (let row = GRID_SIZE - 1; row >= 0; row--) {
                grid[row * GRID_SIZE + col] = newTiles[GRID_SIZE - 1 - row];
            }
        }
    }
    return moved;
}

function slideAndMerge(tiles) {
    let newTiles = tiles.filter(tile => tile !== 0);
    for (let i = 0; i < newTiles.length - 1; i++) {
        if (newTiles[i] === newTiles[i + 1]) {
            newTiles[i] *= 2;
            score += newTiles[i];
            newTiles.splice(i + 1, 1);
        }
    }
    while (newTiles.length < GRID_SIZE) {
        newTiles.push(0);
    }
    return newTiles;
}

function checkGameOver() {
    if (grid.some(tile => tile === WINNING_VALUE)) {
        gameOver = true;
        document.querySelector('.game-over p').textContent = '你赢了！';
        document.querySelector('.game-over').style.display = 'flex';
        return;
    }
    
    if (!grid.includes(0) && !canMerge()) {
        gameOver = true;
        document.querySelector('.game-over p').textContent = '游戏结束！';
        document.querySelector('.game-over').style.display = 'flex';
    }
}

function canMerge() {
    for (let i = 0; i < GRID_CELLS; i++) {
        if (i % GRID_SIZE !== GRID_SIZE - 1 && grid[i] === grid[i + 1]) {
            return true;
        }
        if (i < GRID_CELLS - GRID_SIZE && grid[i] === grid[i + GRID_SIZE]) {
            return true;
        }
    }
    return false;
}

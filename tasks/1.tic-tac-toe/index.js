const CROSS = 'X';
const ZERO = 'O';
const EMPTY = ' ';

const container = document.getElementById('fieldWrapper');
let map;
let isCrossCurrentPlayer = true;
let isGameOver = false;
let dimension = 10;
let countToWin = 5;

startGame();
addResetListener();

function startGame() {
    map = createEmptyMap(dimension);
    isCrossCurrentPlayer = true;
    isGameOver = false;
    renderGrid(dimension);
}

function renderGrid(dimension) {
    container.innerHTML = '';

    for (let i = 0; i < dimension; i++) {
        const row = document.createElement('tr');
        for (let j = 0; j < dimension; j++) {
            const cell = document.createElement('td');
            cell.textContent = EMPTY;
            cell.addEventListener('click', () => cellClickHandler(i, j));
            row.appendChild(cell);
        }
        container.appendChild(row);
    }
}

function createEmptyMap(dimension) {
    let map = [];
    for (let row = 0; row < dimension; row++) {
        map[row] = [];
        for (let col = 0; col < dimension; col++) {
            map[row][col] = undefined;
        }
    }
    return map;
}

function cellClickHandler(row, col) {
    if (isGameOver) {
        return;
    }
    const currentSymbol = isCrossCurrentPlayer ? CROSS : ZERO;
    if (map[row][col] === undefined) {
        renderSymbolInCell(currentSymbol, row, col);
        map[row][col] = currentSymbol;
        isCrossCurrentPlayer = !isCrossCurrentPlayer;
        let winnerLine = checkWinner(map, row, col);
        if (winnerLine.length !== 0) {
            for (let item of winnerLine) {
                renderSymbolInCell(currentSymbol, item.row, item.col, "#ff0000")
            }
            alert(currentSymbol);
            isGameOver = true;
        }
        if (checkDraw(map)) {
            alert("Победила дружба");
            isGameOver = true;
        }
    }
}

function checkWinner(map, row, col) {
    const currentSymbol = map[row][col];
    for (let item of getLineData(countToWin, row, col)) {
        let currentLine = checkLineOnWinner(getLineOfSymbols(map, item.start, item.delta, item.count), currentSymbol, countToWin);
        if (currentLine.length != 0) {
            return currentLine;
        }
    }
    return [];
}

function getLineData(lineSize, row, col) {
    return [
        {start: {x: col - lineSize + 1, y: row - lineSize + 1}, delta: {x: 1, y: 1}, count: lineSize * 2 - 1},
        {start: {x: col, y: row - lineSize + 1}, delta: {x: 0, y: 1}, count: lineSize * 2 - 1},
        {start: {x: col - lineSize + 1, y: row}, delta: {x: 1, y: 0}, count: lineSize * 2 - 1},
        {start: {x: col + lineSize - 1, y: row + lineSize - 1}, delta: {x: -1, y: -1}, count: lineSize * 2 - 1}

    ];
}

function getLineOfSymbols(map, start, delta, count) {
    let result = [];
    for (let index = 0; index < count; index++) {
        let rowIndex = start.y + delta.y * index;
        let colIndex = start.x + delta.x * index;
        let row = map[rowIndex];
        let value = row === undefined ? row : row[colIndex];
        result.push({row: rowIndex, col: colIndex, value: value});
    }
    return result;
}

function checkLineOnWinner(line, symbol, countToWin) {
    let result = [];
    for (let item of line) {
        if (item.value === symbol) {
            result.push(item);
        } else {
            result = [];
        }
        if (result.length === countToWin) {
            return result;
        }
    }
    return [];
}

function checkDraw(map) {
    for (let row of map) {
        for (let col of row) {
            if (col === undefined) {
                return false;
            }
        }
    }
    return true;
}

function renderSymbolInCell(symbol, row, col, color = '#333') {
    const targetCell = findCell(row, col);

    targetCell.textContent = symbol;
    targetCell.style.color = color;
}

function findCell(row, col) {
    const targetRow = container.querySelectorAll('tr')[row];
    return targetRow.querySelectorAll('td')[col];
}

function addResetListener() {
    const resetButton = document.getElementById('reset');
    resetButton.addEventListener('click', resetClickHandler);
}

function resetClickHandler() {
    startGame();
}


/* Test Function */

/* Победа первого игрока */
function testWin() {
    clickOnCell(0, 2);
    clickOnCell(0, 0);
    clickOnCell(2, 0);
    clickOnCell(1, 1);
    clickOnCell(2, 2);
    clickOnCell(1, 2);
    clickOnCell(2, 1);
}

/* Ничья */
function testDraw() {
    clickOnCell(2, 0);
    clickOnCell(1, 0);
    clickOnCell(1, 1);
    clickOnCell(0, 0);
    clickOnCell(1, 2);
    clickOnCell(1, 2);
    clickOnCell(0, 2);
    clickOnCell(0, 1);
    clickOnCell(2, 1);
    clickOnCell(2, 2);
}

function clickOnCell(row, col) {
    findCell(row, col).click();
}

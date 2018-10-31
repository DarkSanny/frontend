import Game from "./game.js";
import Field from "./field.js";

const container = document.getElementById('fieldWrapper');

function playAi(game){
    if (game.currentPlayer !== Game.ZERO)
        return;
    let maxWeight = getMostBestToStepCell(game);
    console.log("Max weight: " + maxWeight.weight);
    game.makeStep(maxWeight.row, maxWeight.col, Game.ZERO);
    playAi(game);
}

function getMostBestToStepCell(game) {
    let field = game.field;
    let emptyCells = field.emptyCells;
    let weights = [];
    for (let cell of emptyCells) {
        let weight = Field.getDeltas(game.countToWin + 1, cell.row, cell.col)
            .map((deltaData) => field.getLineByDelta(deltaData))
            .map((line) => Field.weightLine(line, Game.ZERO, Game.EMPTY) +  Field.weightLine(line, Game.CROSS, Game.EMPTY))
            .reduce((a, b) => a + b);
        weights.push({row: cell.row, col: cell.col, weight: weight});
    }
    return weights.sort((a, b) => b.weight - a.weight)[0];
}

let gameSettings = {
    dimension: 10,
    countToWin: 5
};

let game;

startGame();
addButtonListeners();

function startGame() {
    game = new Game(gameSettings);
    renderGrid(game);
    game.on('enlargeField', () => renderGrid(game));
    game.on('makeStep', (row, col, symbol) => makeStepHandler(row, col, symbol));
}

function renderGrid(game) {
    container.innerHTML = '';

    let field = game.field;

    for (let i = 0; i < field.height; i++) {
        const row = document.createElement('tr');
        for (let j = 0; j < field.width; j++) {
            const cell = document.createElement('td');
            cell.textContent = game.getSymbolFromField(i, j);
            cell.addEventListener('click', () => cellClickHandler(i, j));
            row.appendChild(cell);
        }
        container.appendChild(row);
    }
}

function makeStepHandler(row, col, symbol) {
    renderSymbolInCell(symbol, row, col);
    renderLastStep(game);
    const gameStatus = game.status;
    if (gameStatus !== null) {
        alert(gameStatus.symbol);
        renderCells(gameStatus.line, "#ff0000");
    }
}

function cellClickHandler(row, col) {
    game.makeStep(row, col, game.currentPlayer);
    playAi(game);
}

function renderLastStep(game) {
    const secondStep = game.lastSteps[game.lastSteps.length - 2];
    if (secondStep !== undefined)
        findCell(secondStep.y, secondStep.x).classList.remove('lastStep');
    const lastStep = game.lastSteps[game.lastSteps.length - 1];
    if (lastStep !== undefined)
        findCell(lastStep.y, lastStep.x).classList.add('lastStep');
}

function renderCells(cells, color = "#333") {
    for (let cell of cells) {
        renderSymbolInCell(cell.symbol, cell.row, cell.col, color);
    }
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

function addButtonListeners() {
    const resetButton = document.getElementById('reset');
    resetButton.addEventListener('click', resetClickHandler);
    const setSetting = document.getElementById('setSettings');
    setSetting.addEventListener('click', setSettingsClickHandler);
}

function resetClickHandler() {
    startGame();
}

function setSettingsClickHandler() {
    let dimension = +document.getElementById('fieldSize').value;
    gameSettings.dimension = dimension > 3 ? dimension : 3;
    let countToWin = +document.getElementById('lineToWin').value;
    gameSettings.countToWin = countToWin < 3 ? 3 : countToWin;
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

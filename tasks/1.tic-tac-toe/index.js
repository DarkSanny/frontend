const CROSS = 'X';
const ZERO = 'O';
const EMPTY = ' ';

const container = document.getElementById('fieldWrapper');

let eventMixin = {
    on: function (eventName, handler) {
        if (!this._eventHandlers) this._eventHandlers = {};
        if (!this._eventHandlers[eventName]) {
            this._eventHandlers[eventName] = [];
        }
        this._eventHandlers[eventName].push(handler);
    },

    off: function (eventName, handler) {
        let handlers = this._eventHandlers && this._eventHandlers[eventName];
        if (!handlers) return;
        for (let i = 0; i < handlers.length; i++) {
            if (handlers[i] === handler) {
                handlers.splice(i--, 1);
            }
        }
    },

    trigger: function (eventName) {
        if (!this._eventHandlers || !this._eventHandlers[eventName]) {
            return;
        }
        let handlers = this._eventHandlers[eventName];
        for (let i = 0; i < handlers.length; i++) {
            handlers[i].apply(this, [].slice.call(arguments, 1));
        }
    }
};

class Point {
    constructor(x, y) {
        this._x = x;
        this._y = y;
    }

    get x() {
        return this._x;
    }

    get y() {
        return this._y;
    }

    add(point) {
        return new Point(this._x + point.x, this._y + point.y);
    }
}

class Game {
    constructor(gameSettings) {
        this._gameSettings = gameSettings;
        this._currentDimension = gameSettings.dimension;
        this._isCrossCurrentPlayer = true;
        this._field = new Field(gameSettings.dimension, gameSettings.dimension);
        this._lastSteps = [];
    }

    get field() {
        return this._field;
    }

    get currentPlayer() {
        return this._isCrossCurrentPlayer ? CROSS : ZERO;
    }

    get lastSteps() {
        return this._lastSteps;
    }

    get status() {
        return this._status === undefined ? null : this._status;
    }

    get countToWin() {
        return this._gameSettings.countToWin;
    }

    getSymbolFromField(row, col) {
        return this._field.get(row, col);
    }

    makeStep(row, col, symbol) {
        if (this._status !== undefined || !this._field.isEmpty(row, col))
            return;
        this._field.put(row, col, symbol);
        this._lastSteps.push(new Point(col, row));
        this._isCrossCurrentPlayer = !this._isCrossCurrentPlayer;
        const winnerLine = this.getWinningLine(row, col);
        if (winnerLine.length !== 0) {
            this._status = {symbol: symbol, line: winnerLine};
        }
        if (this._field.emptyCells.length < this._currentDimension * this._currentDimension / 2) {
            this.enlargeField(1, 1);
            this.trigger('makeStep', row + 1, col + 1, symbol);
        } else {
            this.trigger('makeStep', row, col, symbol);
        }
    }

    getWinningLine(row, col) {
        if (this._field.isEmpty(row, col))
            return [];
        const currentSymbol = this._field.get(row, col);
        const winnerLines = Field.getDeltas(this._gameSettings.countToWin, row, col)
            .map((deltaData) => this._field.getLineByDelta(deltaData))
            .map((line) => Field.checkLineOnWinner(line, currentSymbol, this._gameSettings.countToWin))
            .filter((line) => line.length !== 0);
        return winnerLines[0] !== undefined ? winnerLines[0] : [];
    }

    enlargeField(dDimensionStart, dDimensionEnd) {
        if (dDimensionStart <= 0 || dDimensionEnd <= 0)
            return;
        const tmpDimension = this._currentDimension + dDimensionStart + dDimensionEnd;
        const newField = new Field(tmpDimension, tmpDimension);
        for (let row = 0; row < this._currentDimension; row++)
            for (let col = 0; col < this._currentDimension; col++)
                newField.put(row + dDimensionStart, col + dDimensionStart, this._field.get(row, col));
        this._currentDimension = tmpDimension;
        this._field = newField;
        this._lastSteps = this._lastSteps.map((point) => point.add(new Point(dDimensionStart, dDimensionStart)));
        this.trigger('enlargeField');
    }
}

for (let key in eventMixin) {
    Game.prototype[key] = eventMixin[key];
}

class Field {
    constructor(width, height) {
        this._map = Field.createEmptyMap(width, height);
        this._width = width;
        this._height = height;
    }

    get width() {
        return this._width;
    }

    get height() {
        return this._height;
    }

    isEmpty(row, col) {
        return this._map[row] === undefined
            || this._map[row][col] === undefined
            || this._map[row][col] === EMPTY;
    }

    put(row, col, symbol) {
        this._map[row][col] = symbol;
    }

    get(row, col) {
        if (this._map[row] === undefined || this._map[row][col] === undefined)
            return EMPTY;
        return this._map[row][col];
    }

    getLineByDelta(delta) {
        let result = [];
        let row = delta.start.y;
        let col = delta.start.x;
        for (let index = 0; index < delta.count; index++) {
            let symbol = this.get(row, col);
            result.push({row: row, col: col, symbol: symbol});
            row += delta.delta.y;
            col += delta.delta.x;
        }
        return result;
    }

    get emptyCells() {
        let cells = [];
        for (let row = 0; row < this._height; row++)
            for (let col = 0; col < this._width; col++)
                if (this.isEmpty(row, col))
                    cells.push({row: row, col: col});
        return cells;
    }

    static createEmptyMap(width, height) {
        const result = [];
        for (let y = 0; y < height; y++) {
            result[y] = [];
            for (let x = 0; x < width; x++)
                result[y][x] = EMPTY;
        }
        return result;
    }

    static getDeltas(lineSize, row, col) {
        return [
            {start: {x: col - lineSize + 1, y: row - lineSize + 1}, delta: {x: 1, y: 1}, count: lineSize * 2 - 1},
            {start: {x: col, y: row - lineSize + 1}, delta: {x: 0, y: 1}, count: lineSize * 2 - 1},
            {start: {x: col - lineSize + 1, y: row}, delta: {x: 1, y: 0}, count: lineSize * 2 - 1},
            {start: {x: col - lineSize + 1, y: row + lineSize - 1}, delta: {x: 1, y: -1}, count: lineSize * 2 - 1}
        ];
    }

    static checkLineOnWinner(line, symbol, countToWin) {
        let result = [];
        for (let item of line) {
            if (item.symbol === symbol) {
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

    static weightLine(line, symbol) {
        if (line.length % 2 !== 1)
            return 0;
        const index = (line.length + 1) / 2 - 1;
        if (line[index].symbol !== EMPTY)
            return 0;
        let count = 0;
        for (let i = 0; i < line.length; i++) {
            if (line[i].symbol === symbol || i === index)
                count++;
            else if (i > index)
                break;
            else
                count = 0;
        }
        if (count > index)
            count *= 100;
        return count;
    }
}

function playAi(game){
    if (game.currentPlayer !== ZERO)
        return;
    let maxWeight = getMostBestToStepCell(game);
    game.makeStep(maxWeight.row, maxWeight.col, ZERO);
    playAi(game);
}

function getMostBestToStepCell(game) {
    let field = game.field;
    let emptyCells = field.emptyCells;
    let weights = [];
    for (let cell of emptyCells) {
        let weight = Field.getDeltas(game.countToWin, cell.row, cell.col)
            .map((deltaData) => field.getLineByDelta(deltaData))
            .map((line) => Field.weightLine(line, ZERO) +  4 * Field.weightLine(line, CROSS) - 4)
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
